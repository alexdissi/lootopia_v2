"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/hunt/step/progress - Récupérer la progression des étapes
export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté
    let session;
    try {
      session = await auth.api.getSession({ headers: await headers() });
      if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    } catch (authError) {
      console.error("Erreur d'authentification:", authError);
      return NextResponse.json(
        { error: "Erreur d'authentification. Veuillez vous reconnecter." },
        { status: 401 },
      );
    }

    const user = session.user;

    // Récupérer le paramètre huntId de la requête
    const { searchParams } = new URL(request.url);
    const huntId = searchParams.get("huntId");

    if (!huntId) {
      return NextResponse.json(
        { error: "ID de chasse requis" },
        { status: 400 },
      );
    }

    // Vérifier si la chasse existe
    try {
      const hunt = await prisma.treasureHunt.findUnique({
        where: { id: huntId },
      });

      if (!hunt) {
        return NextResponse.json(
          { error: "Chasse au trésor introuvable" },
          { status: 404 },
        );
      }
    } catch (dbError) {
      console.error("Erreur lors de la recherche de la chasse:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la recherche de la chasse" },
        { status: 500 },
      );
    }

    // Vérifier si l'utilisateur participe à cette chasse
    let participation;
    try {
      participation = await prisma.participation.findFirst({
        where: {
          userId: user.id,
          huntId,
        },
      });

      // Si l'utilisateur ne participe pas, renvoyer une réponse 403
      if (!participation) {
        return NextResponse.json(
          {
            steps: [],
            totalSteps: 0,
            completedSteps: 0,
            progressPercentage: 0,
            totalScore: 0,
            error: "Vous ne participez pas à cette chasse",
          },
          { status: 403 },
        );
      }
    } catch (dbError) {
      console.error(
        "Erreur lors de la vérification de la participation:",
        dbError,
      );

      // Au lieu de retourner un statut 500, on renvoie un objet valide avec une erreur
      return NextResponse.json(
        {
          steps: [],
          totalSteps: 0,
          completedSteps: 0,
          progressPercentage: 0,
          totalScore: 0,
          error: "Erreur lors de la vérification de la participation",
        },
        { status: 200 },
      );
    }

    // Récupérer toutes les étapes de la chasse
    let steps;
    try {
      steps = await prisma.huntStep.findMany({
        where: { huntId },
        orderBy: { stepOrder: "asc" },
      });
    } catch (dbError) {
      console.error("Erreur lors de la récupération des étapes:", dbError);
      // Retourner un objet valide avec erreur au lieu d'un statut 500
      return NextResponse.json(
        {
          steps: [],
          totalSteps: 0,
          completedSteps: 0,
          progressPercentage: 0,
          totalScore: 0,
          error: "Erreur lors de la récupération des étapes",
        },
        { status: 200 },
      );
    }

    // Si aucune étape n'est trouvée, retourner un résultat vide mais valide
    if (!steps || steps.length === 0) {
      return NextResponse.json({
        steps: [],
        totalSteps: 0,
        completedSteps: 0,
        progressPercentage: 0,
        totalScore: 0,
      });
    }

    // Récupérer la progression des étapes - Approche simplifiée et plus robuste
    let stepsWithProgress = [];
    let completedSteps = 0;

    try {
      // Tenter de récupérer la progression des étapes directement
      // Si la table n'existe pas ou n'est pas encore prête, la requête échouera proprement
      // et nous passerons à l'approche par défaut
      const stepProgress = await prisma.stepProgress
        .findMany({
          where: {
            participationId: participation.id,
          },
        })
        .catch(() => []); // En cas d'erreur, renvoyer un tableau vide

      if (stepProgress.length > 0) {
        // Si nous avons réussi à récupérer des données de progression
        const progressMap = new Map();
        stepProgress.forEach((progress) => {
          progressMap.set(progress.stepId, {
            isCompleted: progress.isCompleted,
            completedAt: progress.completedAt,
            points: progress.points,
          });

          if (progress.isCompleted) {
            completedSteps++;
          }
        });

        stepsWithProgress = steps.map((step) => {
          const progress = progressMap.get(step.id);
          return {
            ...step,
            isCompleted: progress ? progress.isCompleted : false,
            completedAt: progress ? progress.completedAt : null,
            points: progress ? progress.points : 0,
          };
        });
      } else {
        // Si aucune donnée de progression n'est disponible, utiliser l'approche par défaut
        stepsWithProgress = steps.map((step) => ({
          ...step,
          isCompleted: false,
          completedAt: null,
          points: 0,
        }));
      }
    } catch (progressError) {
      console.error(
        "Erreur lors de la récupération de la progression:",
        progressError,
      );
      // En cas d'erreur, continuer avec une progression vide
      stepsWithProgress = steps.map((step) => ({
        ...step,
        isCompleted: false,
        completedAt: null,
        points: 0,
      }));
    }

    // Calculer les statistiques
    const totalSteps = steps.length;
    const progressPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const totalScore = stepsWithProgress.reduce(
      (sum, step) => sum + (step.points || 0),
      0,
    );

    // Renvoyer les données de progression
    return NextResponse.json({
      steps: stepsWithProgress,
      totalSteps,
      completedSteps,
      progressPercentage,
      totalScore,
    });
  } catch (error) {
    console.error("GET /api/hunt/step/progress -", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 },
    );
  }
}

// POST /api/hunt/step/progress - Mettre à jour la progression d'une étape
export async function POST(request: NextRequest) {
  try {
    console.log(
      "DEBUG: Début de la requête POST pour mise à jour de progression",
    );

    // Récupérer l'utilisateur connecté
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      console.log("DEBUG: Utilisateur non authentifié");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = session.user;
    console.log(`DEBUG: Utilisateur identifié: ${user.id}`);

    // Récupérer les données de la requête
    const body = await request.json();
    const { stepId, huntId, isCompleted } = body;
    console.log(
      `DEBUG: Données reçues - stepId: ${stepId}, huntId: ${huntId}, isCompleted: ${isCompleted}`,
    );

    if (!stepId || !huntId) {
      console.log("DEBUG: stepId ou huntId manquant");
      return NextResponse.json(
        { error: "stepId et huntId requis" },
        { status: 400 },
      );
    }

    try {
      // Vérifier si l'étape existe et appartient à cette chasse
      const step = await prisma.huntStep.findFirst({
        where: {
          id: stepId,
          huntId: huntId,
        },
      });

      if (!step) {
        console.log(
          `DEBUG: Étape introuvable ou n'appartient pas à cette chasse`,
        );
        return NextResponse.json(
          { error: "Étape introuvable pour cette chasse" },
          { status: 404 },
        );
      }

      console.log(`DEBUG: Étape trouvée: ${step.id}, ordre: ${step.stepOrder}`);

      // Vérifier si l'utilisateur participe à cette chasse
      const participation = await prisma.participation.findFirst({
        where: {
          userId: user.id,
          huntId,
        },
      });

      if (!participation) {
        console.log(
          `DEBUG: L'utilisateur ${user.id} ne participe pas à la chasse ${huntId}`,
        );
        return NextResponse.json(
          { error: "Vous ne participez pas à cette chasse" },
          { status: 403 },
        );
      }

      console.log(`DEBUG: Participation trouvée: ${participation.id}`);

      // Utiliser upsert pour créer ou mettre à jour la progression
      const stepProgress = await prisma.stepProgress.upsert({
        where: {
          userId_stepId_participationId: {
            userId: user.id,
            stepId,
            participationId: participation.id,
          },
        },
        update: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        create: {
          userId: user.id,
          stepId,
          participationId: participation.id,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      console.log(
        `DEBUG: Progression ${stepProgress.id} ${isCompleted ? "validée" : "dévalidée"} avec succès`,
      );

      // Calculer les nouvelles statistiques de progression
      console.log(`DEBUG: Calcul des statistiques de progression`);

      const totalSteps = await prisma.huntStep.count({
        where: { huntId },
      });
      console.log(`DEBUG: Nombre total d'étapes: ${totalSteps}`);

      const completedStepsCount = await prisma.stepProgress.count({
        where: {
          participationId: participation.id,
          isCompleted: true,
        },
      });
      console.log(`DEBUG: Nombre d'étapes complétées: ${completedStepsCount}`);

      const progressPercentage =
        totalSteps > 0
          ? Math.round((completedStepsCount / totalSteps) * 100)
          : 0;
      console.log(`DEBUG: Pourcentage de progression: ${progressPercentage}%`);

      // Revalider le chemin pour mettre à jour l'interface utilisateur
      console.log(`DEBUG: Revalidation du chemin pour le huntId: ${huntId}`);
      revalidatePath(`/hunt/${huntId}`);

      // Retourner une réponse détaillée pour aider au débogage
      const response = {
        success: true,
        message: isCompleted
          ? "Étape marquée comme complétée"
          : "Étape marquée comme non complétée",
        stats: {
          totalSteps,
          completedSteps: completedStepsCount,
          progressPercentage,
          totalScore: completedStepsCount * 10,
        },
      };

      console.log(
        `DEBUG: Réponse envoyée avec succès:`,
        JSON.stringify(response),
      );
      return NextResponse.json(response);
    } catch (dbError) {
      console.error("DEBUG: Erreur de base de données détaillée:", dbError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Erreur de base de données lors de la mise à jour de la progression",
          details: dbError.message || "Erreur inconnue",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("POST /api/hunt/step/progress - Erreur générale:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour de la progression",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
