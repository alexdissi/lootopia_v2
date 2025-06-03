"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

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
  error?: string; // Champ pour stocker les messages d'erreur
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
      try {
        if (!huntId) {
          return {
            steps: [],
            totalSteps: 0,
            completedSteps: 0,
            progressPercentage: 0,
            totalScore: 0,
          };
        }

        const response = await fetch(
          `/api/hunt/step/progress?huntId=${huntId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Si la réponse n'est pas OK, on retourne un objet valide avec un message d'erreur
        if (!response.ok) {
          let errorMessage = `Erreur HTTP: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            // Si on ne peut pas parser la réponse, on utilise le message par défaut
          }

          // Retourner un objet valide avec un message d'erreur au lieu de lancer une exception
          console.error("API error:", errorMessage);

          // On retourne un objet valide mais vide avec un message d'erreur
          return {
            steps: [],
            totalSteps: 0,
            completedSteps: 0,
            progressPercentage: 0,
            totalScore: 0,
            error: errorMessage,
          };
        }

        // Si tout va bien, on parse la réponse
        const data = await response.json();

        // Vérification supplémentaire de la structure des données
        if (!data || !data.steps) {
          return {
            steps: [],
            totalSteps: 0,
            completedSteps: 0,
            progressPercentage: 0,
            totalScore: 0,
            error: "Format de données invalide reçu de l'API",
          };
        }

        return data;
      } catch (error) {
        // Capturer toutes les erreurs et retourner un objet valide
        console.error("useHuntProgress - Fetch error:", error);
        return {
          steps: [],
          totalSteps: 0,
          completedSteps: 0,
          progressPercentage: 0,
          totalScore: 0,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        };
      }
    },
    enabled: Boolean(huntId),
    retry: 1,
    staleTime: 30000,
  });

  // Mutation pour valider/dévalider une étape
  const toggleStepCompletion = async (
    stepId: string,
    isCurrentlyCompleted: boolean
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/hunt/step/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepId,
          huntId,
          isCompleted: !isCurrentlyCompleted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("toggleStepCompletion - Error:", errorData);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la progression de l'étape.",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();

      // Succès - mettre à jour le cache et afficher un toast
      queryClient.invalidateQueries({ queryKey: ["huntProgress", huntId] });

      toast({
        title: isCurrentlyCompleted ? "Étape dévélidée" : "Étape validée",
        description: isCurrentlyCompleted
          ? "L'étape a été retirée de votre progression"
          : "Félicitations ! L'étape a été ajoutée à votre progression",
        variant: "default",
      });

      return result;
    } catch (error) {
      console.error("Error toggling step completion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
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
  const errorMessage = data?.error; // Récupérer le message d'erreur des données

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
    errorMessage, // Exposer le message d'erreur
  };
}
