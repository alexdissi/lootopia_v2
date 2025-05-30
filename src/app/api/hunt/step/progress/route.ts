import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// Fonction utilitaire pour récupérer la progression des étapes
async function getProgressForParticipation(
  participation: any,
  huntId: string,
  userId: string,
) {
  // Récupérer toutes les étapes de la chasse
  const steps = await prisma.huntStep.findMany({
    where: {
      huntId: huntId,
    },
    orderBy: {
      stepOrder: "asc",
    },
  });

  // Récupérer la progression de l'utilisateur pour ces étapes
  const progress = await prisma.stepProgress.findMany({
    where: {
      userId: userId,
      participationId: participation.id,
      stepId: {
        in: steps.map((step) => step.id),
      },
    },
  });

  // Pour chaque étape qui n'a pas d'entrée de progression, créer une entrée par défaut
  const stepIdsWithProgress = progress.map((p) => p.stepId);
  const stepsWithoutProgress = steps.filter(
    (step) => !stepIdsWithProgress.includes(step.id),
  );

  if (stepsWithoutProgress.length > 0) {
    // Créer des entrées de progression pour les étapes sans progression
    await prisma.stepProgress.createMany({
      data: stepsWithoutProgress.map((step) => ({
        userId: userId,
        stepId: step.id,
        participationId: participation.id,
        isCompleted: false,
        completedAt: null,
      })),
      skipDuplicates: true,
    });

    // Récupérer à nouveau la progression après l'ajout des nouvelles entrées
    const updatedProgress = await prisma.stepProgress.findMany({
      where: {
        userId: userId,
        participationId: participation.id,
        stepId: {
          in: steps.map((step) => step.id),
        },
      },
    });

    // Utiliser la progression mise à jour
    if (updatedProgress.length > progress.length) {
      progress.push(
        ...updatedProgress.filter(
          (up) => !progress.some((p) => p.stepId === up.stepId),
        ),
      );
    }
  }

  // Calculer le score (10 points par étape validée)
  const completedSteps = progress.filter((p) => p.isCompleted).length;
  const totalScore = completedSteps * 10;

  // Calculer le pourcentage de progression
  const progressPercentage =
    steps.length > 0 ? Math.floor((completedSteps / steps.length) * 100) : 0;

  // Enrichir les étapes avec leur statut de progression
  const stepsWithProgress = steps.map((step) => {
    const stepProgress = progress.find((p) => p.stepId === step.id);
    return {
      ...step,
      isCompleted: stepProgress?.isCompleted || false,
      completedAt: stepProgress?.completedAt || null,
    };
  });

  return NextResponse.json({
    steps: stepsWithProgress,
    totalSteps: steps.length,
    completedSteps,
    progressPercentage,
    totalScore,
  });
}

// GET: Récupérer la progression des étapes pour une participation donnée
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(req.url);
    const huntId = searchParams.get("huntId");

    console.log("GET /api/hunt/step/progress - Request params:", {
      huntId,
      userId: session?.user?.id,
    });

    if (!session?.user) {
      console.log(
        "GET /api/hunt/step/progress - Unauthorized: No session user",
      );
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    if (!huntId) {
      console.log(
        "GET /api/hunt/step/progress - Bad request: No huntId provided",
      );
      return NextResponse.json(
        { error: "ID de chasse requis" },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur participe à cette chasse
    const participation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        huntId: huntId,
      },
    });

    // MODE DÉVELOPPEMENT: Créer une participation temporaire si l'utilisateur n'est pas participant
    if (participation) {
      return await getProgressForParticipation(
        participation,
        huntId,
        session.user.id,
      );
    }
    
    console.log(
      "GET /api/hunt/step/progress - Creating temporary participation for development",
    );

    // Vérifions d'abord si la chasse existe
    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
    });

    if (!hunt) {
      console.log("GET /api/hunt/step/progress - Hunt not found");
      return NextResponse.json(
        { error: "Chasse au trésor introuvable" },
        { status: 404 },
      );
    }

    try {
      // En mode développement, on crée une participation temporaire pour permettre les tests
      const tempParticipation = await prisma.participation.create({
        data: {
          userId: session.user.id,
          huntId: huntId,
          status: "ONGOING",
        },
      });

      console.log(
        "GET /api/hunt/step/progress - Temporary participation created:",
        tempParticipation.id,
      );

      // On utilise cette participation temporaire
      return await getProgressForParticipation(
        tempParticipation,
        huntId,
        session.user.id,
      );
    } catch (error) {
      console.error(
        "GET /api/hunt/step/progress - Error creating temporary participation:",
        error,
      );
      return NextResponse.json(
        {
          error: "Impossible de créer une participation temporaire",
          details: String(error),
        },
        { status: 500 },
      );
    }

    return await getProgressForParticipation(
      participation,
      huntId,
      session.user.id,
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 },
    );
  }
}

// POST: Valider/dévalider une étape
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { stepId, huntId, isCompleted } = body;

    console.log("POST /api/hunt/step/progress - Request body:", {
      stepId,
      huntId,
      isCompleted,
      userId: session.user.id,
    });

    if (!stepId || !huntId) {
      return NextResponse.json(
        { error: "ID d'étape et ID de chasse requis" },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur participe à cette chasse
    const participation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        huntId: huntId,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Vous ne participez pas à cette chasse" },
        { status: 403 },
      );
    }

    // Vérifier que l'étape existe et appartient à cette chasse
    const step = await prisma.huntStep.findFirst({
      where: {
        id: stepId,
        huntId: huntId,
      },
    });

    if (!step) {
      console.log(
        "POST /api/hunt/step/progress - Step not found for this hunt",
      );
      return NextResponse.json(
        { error: "Étape non trouvée pour cette chasse" },
        { status: 404 },
      );
    }

    // Mettre à jour ou créer la progression de l'étape
    const stepProgress = await prisma.stepProgress.upsert({
      where: {
        userId_stepId_participationId: {
          userId: session.user.id,
          stepId: stepId,
          participationId: participation.id,
        },
      },
      update: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        stepId: stepId,
        participationId: participation.id,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Récupérer toutes les étapes pour calculer la progression globale
    const allSteps = await prisma.huntStep.count({
      where: { huntId },
    });

    // Récupérer les étapes complétées
    const completedSteps = await prisma.stepProgress.count({
      where: {
        userId: session.user.id,
        participationId: participation.id,
        isCompleted: true,
      },
    });

    // Calculer le pourcentage de progression
    const progressPercentage =
      allSteps > 0 ? Math.floor((completedSteps / allSteps) * 100) : 0;

    // Calculer le score total (10 points par étape)
    const totalScore = completedSteps * 10;

    // Si toutes les étapes sont complétées, marquer la participation comme complétée
    if (completedSteps === allSteps && allSteps > 0) {
      await prisma.participation.update({
        where: { id: participation.id },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({
      success: true,
      stepProgress,
      completedSteps,
      totalSteps: allSteps,
      progressPercentage,
      totalScore,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la progression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la progression" },
      { status: 500 },
    );
  }
}
