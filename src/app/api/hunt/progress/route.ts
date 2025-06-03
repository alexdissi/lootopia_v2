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

    // Traiter la progression de l'étape
    const stepProgress = await updateStepProgress({
      userId: session.user.id,
      stepId,
      participationId,
      isCompleted,
    });

    // Mettre à jour le classement et vérifier si toutes les étapes sont complétées
    if (isCompleted) {
      await updateLeaderboard(session.user.id, participation.huntId);
      await checkHuntCompletion({
        userId: session.user.id,
        huntId: participation.huntId,
        participationId,
        treasureHunt: participation.treasureHunt,
      });
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

// Fonction pour mettre à jour ou créer la progression d'une étape
async function updateStepProgress(params: {
  userId: string;
  stepId: string;
  participationId: string;
  isCompleted: boolean;
}) {
  const { userId, stepId, participationId, isCompleted } = params;

  // Trouver ou créer une progression d'étape
  const existingProgress = await prisma.stepProgress.findFirst({
    where: {
      userId,
      stepId,
      participationId,
    },
  });

  if (existingProgress) {
    // Mettre à jour la progression existante
    return prisma.stepProgress.update({
      where: {
        id: existingProgress.id,
      },
      data: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        // Ajouter des points uniquement si l'étape est nouvellement complétée
        ...(isCompleted && !existingProgress.isCompleted ? { points: 10 } : {}),
      },
    });
  } else {
    // Créer une nouvelle progression
    return prisma.stepProgress.create({
      data: {
        userId: userId,
        stepId: stepId,
        participationId: participationId,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        points: isCompleted ? 10 : 0, // 10 points par étape validée, 0 sinon
      },
    });
  }
}

// Fonction pour vérifier si toutes les étapes sont complétées et attribuer des récompenses
async function checkHuntCompletion(params: {
  userId: string;
  huntId: string;
  participationId: string;
  treasureHunt: any;
}) {
  const { userId, huntId, participationId, treasureHunt } = params;

  // Vérifier si toutes les étapes sont complétées
  const allSteps = await prisma.huntStep.findMany({
    where: {
      huntId,
    },
  });

  const completedSteps = await prisma.stepProgress.findMany({
    where: {
      userId,
      participationId,
      isCompleted: true,
    },
  });

  // Si toutes les étapes ne sont pas complétées, rien à faire
  if (completedSteps.length !== allSteps.length) {
    return;
  }

  // Marquer la participation comme terminée
  await prisma.participation.update({
    where: {
      id: participationId,
    },
    data: {
      status: "COMPLETED",
    },
  });

  // Si la chasse est déjà marquée comme terminée, rien à faire
  if (treasureHunt.isFinished) {
    return;
  }

  // Marquer la chasse comme terminée et distribuer les récompenses
  await markHuntAsFinished(userId, huntId, treasureHunt);
}

// Fonction pour marquer une chasse comme terminée et distribuer les récompenses
async function markHuntAsFinished(
  userId: string,
  huntId: string,
  treasureHunt: any,
) {
  // Marquer la chasse comme terminée
  await prisma.treasureHunt.update({
    where: {
      id: huntId,
    },
    data: {
      isFinished: true,
    },
  });

  // Attribuer un artefact spécial au premier joueur à finir
  await prisma.artefact.create({
    data: {
      name: `Trophy for ${treasureHunt.title}`,
      rarity: "LEGENDARY",
      description: "Special trophy for being the first to complete this hunt",
      userId: userId,
      huntId: huntId,
      source: "EVENT",
      isHidden: false,
    },
  });

  // Distribuer les récompenses définies
  await distributeRewards(userId, huntId, treasureHunt.title);
}

// Fonction pour distribuer les récompenses
async function distributeRewards(
  userId: string,
  huntId: string,
  huntTitle: string,
) {
  const rewards = await prisma.reward.findMany({
    where: {
      huntId: huntId,
    },
  });

  for (const reward of rewards) {
    if (reward.type === "VIRTUAL_CURRENCY") {
      // Ajouter de la monnaie virtuelle
      await prisma.virtualCurrency.create({
        data: {
          userId: userId,
          amount: reward.value,
          type: "EARNED",
        },
      });
    } else if (reward.type === "ARTEFACT") {
      // Créer un artefact pour l'utilisateur
      await prisma.artefact.create({
        data: {
          name: `Reward from ${huntTitle}`,
          rarity: "RARE",
          description: reward.description || "Hunt reward",
          userId: userId,
          huntId: huntId,
          source: "EVENT",
          isHidden: false,
        },
      });
    }
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
