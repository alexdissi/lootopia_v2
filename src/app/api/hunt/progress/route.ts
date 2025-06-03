import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { updateLeaderboard } from "@/lib/leaderboard";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { stepId, participationId, isCompleted } = await req.json();

    if (!stepId || !participationId) {
      return NextResponse.json(
        { error: "ID d'étape et ID de participation requis" },
        { status: 400 },
      );
    }

    // Vérifier si l'utilisateur participe à cette chasse
    const participation = await prisma.participation.findUnique({
      where: {
        id: participationId,
        userId: session.user.id,
      },
      include: {
        treasureHunt: true,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Participation non trouvée" },
        { status: 404 },
      );
    }

    // Vérifier si l'étape fait partie de cette chasse
    const step = await prisma.huntStep.findUnique({
      where: {
        id: stepId,
        huntId: participation.huntId,
      },
    });

    if (!step) {
      return NextResponse.json(
        { error: "Étape non trouvée dans cette chasse" },
        { status: 404 },
      );
    }

    // Trouver ou créer une progression d'étape
    let stepProgress = await prisma.stepProgress.findFirst({
      where: {
        userId: session.user.id,
        stepId: stepId,
        participationId: participationId,
      },
    });

    if (stepProgress) {
      // Mettre à jour la progression existante
      stepProgress = await prisma.stepProgress.update({
        where: {
          id: stepProgress.id,
        },
        data: {
          isCompleted: isCompleted,
          completedAt: isCompleted ? new Date() : null,
          // Ajouter des points uniquement si l'étape est nouvellement complétée
          ...(isCompleted && !stepProgress.isCompleted ? { points: 10 } : {}),
        },
      });
    } else {
      // Créer une nouvelle progression
      stepProgress = await prisma.stepProgress.create({
        data: {
          userId: session.user.id,
          stepId: stepId,
          participationId: participationId,
          isCompleted: isCompleted,
          completedAt: isCompleted ? new Date() : null,
          points: isCompleted ? 10 : 0, // 10 points par étape validée, 0 sinon
        },
      });
    }

    // Mettre à jour le classement si l'étape est complétée
    if (isCompleted) {
      await updateLeaderboard(session.user.id, participation.huntId);

      // Vérifier si toutes les étapes sont complétées
      const allSteps = await prisma.huntStep.findMany({
        where: {
          huntId: participation.huntId,
        },
      });

      const completedSteps = await prisma.stepProgress.findMany({
        where: {
          userId: session.user.id,
          participationId: participationId,
          isCompleted: true,
        },
      });

      // Si toutes les étapes sont complétées, marquer la participation comme terminée
      if (completedSteps.length === allSteps.length) {
        await prisma.participation.update({
          where: {
            id: participationId,
          },
          data: {
            status: "COMPLETED",
          },
        });

        // Si la chasse n'est pas encore marquée comme terminée, la marquer
        if (!participation.treasureHunt.isFinished) {
          await prisma.treasureHunt.update({
            where: {
              id: participation.huntId,
            },
            data: {
              isFinished: true,
            },
          });

          // Attribuer un artefact spécial au premier joueur à finir
          await prisma.artefact.create({
            data: {
              name: `Trophy for ${participation.treasureHunt.title}`,
              rarity: "LEGENDARY",
              description:
                "Special trophy for being the first to complete this hunt",
              userId: session.user.id,
              huntId: participation.huntId,
              source: "EVENT",
              isHidden: false,
            },
          });

          // Distribuer les récompenses définies
          const rewards = await prisma.reward.findMany({
            where: {
              huntId: participation.huntId,
            },
          });

          for (const reward of rewards) {
            if (reward.type === "VIRTUAL_CURRENCY") {
              // Ajouter de la monnaie virtuelle
              await prisma.virtualCurrency.create({
                data: {
                  userId: session.user.id,
                  amount: reward.value,
                  type: "EARNED",
                },
              });
            } else if (reward.type === "ARTEFACT") {
              // Créer un artefact pour l'utilisateur
              await prisma.artefact.create({
                data: {
                  name: `Reward from ${participation.treasureHunt.title}`,
                  rarity: "RARE",
                  description: reward.description || "Hunt reward",
                  userId: session.user.id,
                  huntId: participation.huntId,
                  source: "EVENT",
                  isHidden: false,
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json(stepProgress);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la progression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la progression" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const url = new URL(req.url);
    const participationId = url.searchParams.get("participationId");

    if (!participationId) {
      return NextResponse.json(
        { error: "ID de participation requis" },
        { status: 400 },
      );
    }

    // Récupérer la progression de toutes les étapes pour cette participation
    const stepProgresses = await prisma.stepProgress.findMany({
      where: {
        userId: session.user.id,
        participationId: participationId,
      },
      include: {
        step: true,
      },
    });

    return NextResponse.json(stepProgresses);
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 },
    );
  }
}
