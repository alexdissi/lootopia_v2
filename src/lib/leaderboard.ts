import prisma from "@/lib/db";

/**
 * Calcule le score total pour un utilisateur dans une chasse au trésor
 * @param userId ID de l'utilisateur
 * @param huntId ID de la chasse au trésor
 * @returns Le score total et le nombre d'étapes complétées
 */
export async function calculateUserScore(userId: string, huntId: string) {
  try {
    // Récupérer toutes les étapes complétées par l'utilisateur pour cette chasse
    const completedSteps = await prisma.stepProgress.findMany({
      where: {
        userId: userId,
        isCompleted: true,
        participation: {
          huntId: huntId,
        },
      },
    });

    // Nombre d'étapes complétées
    const completedStepsCount = completedSteps.length;

    // Calculer le score total (10 points par étape complétée)
    const totalScore = completedStepsCount * 10;

    // Récupérer le nombre total d'étapes pour cette chasse
    const totalSteps = await prisma.huntStep.count({
      where: {
        huntId: huntId,
      },
    });

    // Calculer le pourcentage de progression
    const progressPercentage =
      totalSteps > 0 ? Math.floor((completedStepsCount / totalSteps) * 100) : 0;

    return {
      totalScore,
      completedStepsCount,
      totalSteps,
      progressPercentage,
    };
  } catch (error) {
    console.error("Erreur lors du calcul du score:", error);
    throw error;
  }
}

/**
 * Met à jour le classement pour un utilisateur spécifique dans une chasse au trésor
 * @param userId ID de l'utilisateur
 * @param huntId ID de la chasse au trésor
 */
export async function updateLeaderboard(userId: string, huntId: string) {
  try {
    // Calculer le score de l'utilisateur
    const { totalScore } = await calculateUserScore(userId, huntId);

    // Vérifier si une entrée de classement existe déjà pour cet utilisateur et cette chasse
    const existingEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId: userId,
        huntId: huntId,
      },
    });

    const now = new Date();

    if (existingEntry) {
      // Mettre à jour l'entrée existante
      await prisma.leaderboardEntry.update({
        where: {
          id: existingEntry.id,
        },
        data: {
          score: totalScore,
          completedAt: now,
        },
      });
    } else {
      // Créer une nouvelle entrée
      await prisma.leaderboardEntry.create({
        data: {
          userId: userId,
          huntId: huntId,
          score: totalScore,
          rank: 0, // Le rang sera mis à jour plus tard
          completedAt: now,
        },
      });
    }

    // Mettre à jour tous les rangs dans le classement pour cette chasse
    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        huntId: huntId,
      },
      orderBy: [{ score: "desc" }, { completedAt: "asc" }],
    });

    // Mettre à jour les rangs
    for (let i = 0; i < leaderboard.length; i++) {
      await prisma.leaderboardEntry.update({
        where: {
          id: leaderboard[i].id,
        },
        data: {
          rank: i + 1,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du classement:", error);
    return { success: false, error };
  }
}

/**
 * Récupère le classement complet pour une chasse au trésor spécifique
 * @param huntId ID de la chasse au trésor
 * @param limit Nombre maximum d'entrées à récupérer (optionnel)
 * @returns Liste des entrées du classement triées par rang
 */
export async function getLeaderboard(huntId: string, limit?: number) {
  try {
    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        huntId: huntId,
      },
      orderBy: [{ rank: "asc" }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error("Erreur lors de la récupération du classement:", error);
    return { success: false, error };
  }
}

/**
 * Récupère la position d'un utilisateur spécifique dans le classement d'une chasse au trésor
 * @param userId ID de l'utilisateur
 * @param huntId ID de la chasse au trésor
 * @returns Détails de l'entrée du classement pour l'utilisateur
 */
export async function getUserRanking(userId: string, huntId: string) {
  try {
    // Récupérer les informations de score et de progression de l'utilisateur
    const userScore = await calculateUserScore(userId, huntId);

    // Récupérer l'entrée de classement de l'utilisateur
    const userEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId: userId,
        huntId: huntId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Si l'utilisateur n'a pas d'entrée dans le classement, en créer une temporaire
    if (!userEntry) {
      // Récupérer la participation pour vérifier si l'utilisateur est inscrit à cette chasse
      const participation = await prisma.participation.findFirst({
        where: {
          userId: userId,
          huntId: huntId,
        },
      });

      if (!participation) {
        return null; // L'utilisateur ne participe pas à cette chasse
      }

      // Récupérer les informations de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          image: true,
        },
      });

      // Calculer le rang de l'utilisateur
      const higherScoreCount = await prisma.leaderboardEntry.count({
        where: {
          huntId: huntId,
          score: {
            gt: userScore.totalScore,
          },
        },
      });

      // Créer une entrée temporaire (non persistée)
      return {
        id: "temp",
        userId: userId,
        huntId: huntId,
        score: userScore.totalScore,
        rank: higherScoreCount + 1,
        completedAt: null,
        user: user,
        ...userScore,
      };
    }

    // Récupérer le nombre d'utilisateurs ayant un score plus élevé pour calculer le rang
    const higherScoreCount = await prisma.leaderboardEntry.count({
      where: {
        huntId: huntId,
        score: {
          gt: userEntry.score,
        },
      },
    });

    // Retourner les informations complètes du classement
    return {
      ...userEntry,
      rank: higherScoreCount + 1,
      ...userScore,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du classement utilisateur:",
      error,
    );
    throw error;
  }
}

/**
 * Valide ou invalide une étape pour un utilisateur dans une chasse au trésor, et met à jour le classement
 * @param params Objet contenant les paramètres : userId, huntId, stepId, isCompleted
 * @returns Détails mis à jour de la progression et du classement
 */
export async function validateStep(
  params: {
    userId: string;
    huntId: string;
    stepId: string;
    isCompleted: boolean;
  }
) {
  try {
    const { userId, huntId, stepId, isCompleted } = params;

    // Vérifier que l'utilisateur participe à cette chasse
    const participation = await prisma.participation.findFirst({
      where: {
        userId: userId,
        huntId: huntId,
      },
    });

    if (!participation) {
      throw new Error("L'utilisateur ne participe pas à cette chasse");
    }

    // Vérifier que l'étape existe et appartient à cette chasse
    const step = await prisma.huntStep.findFirst({
      where: {
        id: stepId,
        huntId: huntId,
      },
    });

    if (!step) {
      throw new Error("Étape non trouvée pour cette chasse");
    }

    // Mettre à jour ou créer la progression de l'étape
    const stepProgress = await prisma.stepProgress.upsert({
      where: {
        userId_stepId_participationId: {
          userId: userId,
          stepId: stepId,
          participationId: participation.id,
        },
      },
      update: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: userId,
        stepId: stepId,
        participationId: participation.id,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Mettre à jour le classement pour l'utilisateur
    await updateLeaderboard(userId, huntId);

    // Récupérer les informations mises à jour
    const { totalScore, completedStepsCount, totalSteps, progressPercentage } =
      await calculateUserScore(userId, huntId);

    // Récupérer la position dans le classement
    const userRanking = await getUserRanking(userId, huntId);

    return {
      success: true,
      stepProgress,
      completedSteps: completedStepsCount,
      totalSteps,
      progressPercentage,
      totalScore,
      ranking: userRanking ? userRanking.rank : null,
    };
  } catch (error) {
    console.error("Erreur lors de la validation de l'étape:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Récupère la progression complète d'un utilisateur pour toutes les étapes d'une chasse au trésor
 * @param userId ID de l'utilisateur
 * @param huntId ID de la chasse au trésor
 * @returns Détails de la progression pour toutes les étapes
 */
export async function getStepProgress(userId: string, huntId: string) {
  try {
    // Vérifier que l'utilisateur participe à cette chasse
    const participation = await prisma.participation.findFirst({
      where: {
        userId: userId,
        huntId: huntId,
      },
    });

    if (!participation) {
      throw new Error("L'utilisateur ne participe pas à cette chasse");
    }

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

    // Enrichir les étapes avec leur statut de progression
    const stepsWithProgress = steps.map((step) => {
      const stepProgress = progress.find((p) => p.stepId === step.id);
      return {
        ...step,
        isCompleted: stepProgress?.isCompleted || false,
        completedAt: stepProgress?.completedAt || null,
      };
    });

    // Calculer le score et la progression globale
    const { totalScore, completedStepsCount, progressPercentage } =
      await calculateUserScore(userId, huntId);

    return {
      success: true,
      steps: stepsWithProgress,
      totalSteps: steps.length,
      completedSteps: completedStepsCount,
      progressPercentage,
      totalScore,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    return { success: false, error: String(error) };
  }
}
