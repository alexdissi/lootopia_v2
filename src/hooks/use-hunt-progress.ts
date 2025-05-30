"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface StepProgressData {
  steps: {
    id: string;
    description?: string;
    stepOrder: number;
    title?: string;
    imageUrl?: string;
    isCompleted: boolean;
    completedAt: string | null;
  }[];
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  totalScore: number;
}

interface ToggleStepCompletionParams {
  stepId: string;
  huntId: string;
  isCompleted: boolean;
}

export function useHuntProgress(huntId: string) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer la progression des étapes
  const {
    data,
    error,
    isLoading: isFetching,
    isError,
  } = useQuery<StepProgressData>({
    queryKey: ["huntProgress", huntId],
    queryFn: async () => {
      console.log("useHuntProgress - Fetching progress for hunt:", huntId);
      try {
        const response = await fetch(
          `/api/hunt/step/progress?huntId=${huntId}`,
        );
        console.log("useHuntProgress - API response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("useHuntProgress - API error:", errorData);
          throw new Error(
            `Erreur lors de la récupération de la progression: ${response.status}`,
          );
        }

        const data = await response.json();
        console.log("useHuntProgress - Progress data received:", data);
        return data;
      } catch (error) {
        console.error("useHuntProgress - Fetch error:", error);
        throw error;
      }
    },
    enabled: !!huntId,
  });

  // Mutation pour valider/dévalider une étape
  const mutation = useMutation({
    mutationFn: async ({
      stepId,
      huntId,
      isCompleted,
    }: ToggleStepCompletionParams) => {
      const response = await fetch("/api/hunt/step/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stepId, huntId, isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la progression");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider et rafraîchir les données de progression
      queryClient.invalidateQueries({ queryKey: ["huntProgress", huntId] });
    },
  });

  // Fonction pour basculer l'état de complétion d'une étape
  const toggleStepCompletion = async (
    stepId: string,
    isCurrentlyCompleted: boolean,
  ) => {
    setIsLoading(true);
    try {
      await mutation.mutateAsync({
        stepId,
        huntId,
        isCompleted: !isCurrentlyCompleted,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Valeurs par défaut si les données ne sont pas encore chargées
  const steps = data?.steps || [];
  const totalSteps = data?.totalSteps || 0;
  const completedSteps = data?.completedSteps || 0;
  const progressPercentage = data?.progressPercentage || 0;
  const totalScore = data?.totalScore || 0;
  const isCompleted = totalSteps > 0 && completedSteps === totalSteps;

  return {
    steps,
    totalSteps,
    completedSteps,
    progressPercentage,
    totalScore,
    isCompleted,
    toggleStepCompletion,
    isLoading: isLoading || isFetching,
    isError,
    error,
  };
}
