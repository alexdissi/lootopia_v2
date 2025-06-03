import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { huntId: string; stepId: string } },
) {
  try {
    const session = await auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { huntId, stepId } = params;
    const userId = session.user.id;

    // Vérifier si l'utilisateur participe à cette chasse
    const participation = await prisma.participation.findFirst({
      where: {
        huntId,
        userId,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Vous ne participez pas à cette chasse" },
        { status: 404 },
      );
    }

    // Vérifier si l'étape existe et appartient à la chasse
    const step = await prisma.huntStep.findFirst({
      where: {
        id: stepId,
        huntId,
      },
    });

    if (!step) {
      return NextResponse.json(
        { error: "Étape non trouvée pour cette chasse" },
        { status: 404 },
      );
    }

    // Chercher si un StepProgress existe déjà
    let stepProgress = await prisma.stepProgress.findFirst({
      where: {
        userId,
        stepId,
        participationId: participation.id,
      },
    });

    // Si le StepProgress n'existe pas, le créer
    if (!stepProgress) {
      stepProgress = await prisma.stepProgress.create({
        data: {
          userId,
          stepId,
          participationId: participation.id,
          isCompleted: true,
          completedAt: new Date(),
          points: 10, // Points par défaut pour une étape validée
        },
      });
    } else {
      // Sinon, mettre à jour le StepProgress existant
      stepProgress = await prisma.stepProgress.update({
        where: {
          id: stepProgress.id,
        },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    // Mettre à jour le LeaderboardEntry ou le créer s'il n'existe pas
    await updateLeaderboard(userId, huntId);

    // Vérifier si toutes les étapes de la chasse sont validées
    await checkHuntCompletion(huntId, userId, participation.id);

    return NextResponse.json(stepProgress);
  } catch (error) {
    console.error("Erreur lors de la validation de l'étape:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation de l'étape" },
      { status: 500 },
    );
  }
}

async function updateLeaderboard(userId: string, huntId: string) {
  // Calculer le score total de l'utilisateur pour cette chasse
  const totalScore = await prisma.stepProgress.aggregate({
    where: {
      userId,
      step: {
        huntId,
      },
      isCompleted: true,
    },
    _sum: {
      points: true,
    },
  });

  const score = totalScore._sum.points || 0;

  // Récupérer tous les scores pour cette chasse et trier par score
  const allScores = await prisma.stepProgress.groupBy({
    by: ["userId"],
    where: {
      step: {
        huntId,
      },
      isCompleted: true,
    },
    _sum: {
      points: true,
    },
    orderBy: {
      _sum: {
        points: "desc",
      },
    },
  });

  // Déterminer le rang de l'utilisateur
  const rank = allScores.findIndex((s) => s.userId === userId) + 1;

  // Mettre à jour ou créer l'entrée du classement
  const existingEntry = await prisma.leaderboardEntry.findFirst({
    where: {
      userId,
      huntId,
    },
  });

  if (existingEntry) {
    await prisma.leaderboardEntry.update({
      where: {
        id: existingEntry.id,
      },
      data: {
        score,
        rank,
        completedAt: new Date(),
      },
    });
  } else {
    await prisma.leaderboardEntry.create({
      data: {
        userId,
        huntId,
        score,
        rank,
        completedAt: new Date(),
      },
    });
  }
}

async function checkHuntCompletion(
  huntId: string,
  userId: string,
  participationId: string,
) {
  // Compter le nombre total d'étapes dans la chasse
  const totalSteps = await prisma.huntStep.count({
    where: {
      huntId,
    },
  });

  // Compter le nombre d'étapes complétées par l'utilisateur
  const completedSteps = await prisma.stepProgress.count({
    where: {
      userId,
      participationId,
      isCompleted: true,
      step: {
        huntId,
      },
    },
  });

  // Si toutes les étapes sont complétées
  if (completedSteps === totalSteps) {
    // Mettre à jour le statut de participation
    await prisma.participation.update({
      where: {
        id: participationId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    // Vérifier si la chasse est terminée pour la première fois
    const hunt = await prisma.treasureHunt.findUnique({
      where: {
        id: huntId,
      },
    });

    // Si la chasse n'est pas encore marquée comme terminée
    if (!hunt?.isFinished) {
      // Marquer la chasse comme terminée
      await prisma.treasureHunt.update({
        where: {
          id: huntId,
        },
        data: {
          isFinished: true,
          status: "COMPLETED",
        },
      });

      // Attribuer un artefact spécial au gagnant (premier joueur)
      await prisma.artefact.create({
        data: {
          name: `Trophée de vainqueur - ${hunt?.title || "Chasse au trésor"}`,
          rarity: "LEGENDARY",
          description:
            "Artefact spécial attribué au premier joueur ayant terminé la chasse",
          imageUrl: "/trophy.png", // Ajustez avec l'URL d'une image appropriée
          userId,
          huntId,
          source: "EVENT",
        },
      });

      // Répartir les récompenses définies dans la table Reward
      const rewards = await prisma.reward.findMany({
        where: {
          huntId,
        },
      });

      // Ajouter des couronnes (monnaie virtuelle) en fonction des récompenses
      for (const reward of rewards) {
        if (reward.type === "CURRENCY") {
          await prisma.virtualCurrency.create({
            data: {
              userId,
              amount: reward.value,
              type: "EARNED",
              transactionHistory: {
                create: {
                  userId,
                  amount: reward.value,
                  transactionType: "EARNED",
                  description: `Récompense pour avoir complété la chasse: ${hunt?.title || "Chasse au trésor"}`,
                },
              },
            },
          });
        }
      }
    }
  }
}
