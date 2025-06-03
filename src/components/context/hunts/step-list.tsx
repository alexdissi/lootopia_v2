import { HuntStep, Participation } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import Image from "next/image";

interface StepListProps {
  steps: HuntStep[];
  participation?: Participation;
  huntId: string;
  isParticipant?: boolean;
}

export const StepList = ({
  steps,
  huntId,
  isParticipant = false,
}: StepListProps) => {
  const { toast } = useToast();

  // Si l'utilisateur n'est pas participant, on affiche simplement la liste des étapes
  if (!isParticipant || !huntId) {
    return <SimpleStepsList steps={steps} />;
  }

  // Pour les participants, utiliser maintenant une approche simplifiée directement dans ce composant
  return <DirectParticipantStepsList steps={steps} huntId={huntId} />;
};

// Version simplifiée pour les non-participants
function SimpleStepsList({ steps }: { steps: HuntStep[] }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucune étape n&apos;a été définie pour cette chasse au trésor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={step.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {step.imageUrl && (
              <div className="relative w-full md:w-48 h-40 flex-shrink-0">
                <Image
                  src={step.imageUrl}
                  alt={step.title ?? `Étape ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-grow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      {step.stepOrder || index + 1}
                    </span>
                    {step.title ?? `Étape ${step.stepOrder || index + 1}`}
                  </div>
                </CardTitle>
                {step.description && (
                  <CardDescription>{step.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {step.latitude && step.longitude && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {step.address ?? `${step.latitude}, ${step.longitude}`}
                    </span>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Version simplifiée pour les participants sans utiliser le hook useHuntProgress
function DirectParticipantStepsList({
  steps: initialSteps,
  huntId,
}: {
  steps: HuntStep[];
  huntId: string;
}) {
  const [steps, setSteps] = useState<
    (HuntStep & { isCompleted?: boolean; completedAt?: string | null })[]
  >(
    initialSteps.map((step) => ({
      ...step,
      isCompleted: false,
      completedAt: null,
    })),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // État local pour suivre les statistiques
  const [stats, setStats] = useState({
    totalSteps: initialSteps.length,
    completedSteps: 0,
    progressPercentage: 0,
    totalScore: 0,
  });

  // Fonction pour charger les données de progression
  const loadProgressData = useCallback(async () => {
    if (!huntId) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/hunt/step/progress?huntId=${huntId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // Utiliser le message par défaut
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || !data.steps) {
        throw new Error("Format de données invalide reçu de l'API");
      }

      // Mettre à jour les étapes avec les données de progression
      // Combiner les données initiales avec les données de progression
      const updatedSteps = initialSteps.map((initialStep) => {
        const progressStep = data.steps.find(
          (s: any) => s.id === initialStep.id,
        );
        return {
          ...initialStep,
          isCompleted: progressStep ? progressStep.isCompleted : false,
          completedAt: progressStep ? progressStep.completedAt : null,
        };
      });

      setSteps(updatedSteps);

      // Mettre à jour les statistiques
      setStats({
        totalSteps: data.totalSteps,
        completedSteps: data.completedSteps,
        progressPercentage: data.progressPercentage,
        totalScore: data.totalScore,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la progression:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");

      // Garder les étapes initiales en cas d'erreur mais ne pas les réinitialiser
    } finally {
      setIsLoading(false);
    }
  }, [huntId, initialSteps]);

  // Fonction pour valider/dévalider une étape
  const toggleStepCompletion = async (stepId: string) => {
    if (isLoading) return; // Éviter les clics multiples pendant le chargement

    const stepToToggle = steps.find((step) => step.id === stepId);
    if (!stepToToggle) return;

    const isCurrentlyCompleted = stepToToggle.isCompleted;
    const updatedIsCompleted = !isCurrentlyCompleted;

    // Mettre à jour l'état local immédiatement pour une UX réactive
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              isCompleted: updatedIsCompleted,
              completedAt: updatedIsCompleted ? new Date() : null,
            }
          : step,
      ),
    );

    // Calculer le nouveau nombre d'étapes complétées
    const updatedStepsCount = steps.filter((step) =>
      step.id === stepId ? updatedIsCompleted : step.isCompleted,
    ).length;

    // Mettre à jour les stats avant l'appel API
    setStats((prev) => ({
      ...prev,
      completedSteps: updatedStepsCount,
      progressPercentage:
        prev.totalSteps > 0
          ? Math.round((updatedStepsCount / prev.totalSteps) * 100)
          : 0,
    }));

    // Maintenant faire l'appel API
    setIsLoading(true);

    console.log(
      `Validation de l'étape ${stepId} pour la chasse ${huntId}, nouvel état: ${updatedIsCompleted}`,
    );

    try {
      const response = await fetch("/api/hunt/step/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepId,
          huntId,
          isCompleted: updatedIsCompleted,
        }),
      });

      console.log(`Statut de la réponse: ${response.status}`);

      // Vérifier si la réponse est un JSON valide
      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur de réponse:", data);
        throw new Error(
          data.error || data.details || `Erreur ${response.status}`,
        );
      }

      console.log("Réponse de validation d'étape:", data);

      // Mettre à jour les statistiques avec les données du serveur
      if (data.stats) {
        setStats({
          totalSteps: data.stats.totalSteps,
          completedSteps: data.stats.completedSteps,
          progressPercentage: data.stats.progressPercentage,
          totalScore: data.stats.totalScore || 0,
        });
      }

      // Notification de succès
      toast({
        title: updatedIsCompleted ? "Étape validée" : "Validation annulée",
        description: updatedIsCompleted
          ? "L'étape a été marquée comme complétée"
          : "L'étape a été marquée comme non complétée",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la validation de l'étape:", error);

      // Restaurer l'état précédent de l'étape
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                isCompleted: isCurrentlyCompleted,
                completedAt: isCurrentlyCompleted ? step.completedAt : null,
              }
            : step,
        ),
      );

      // Restaurer les statistiques précédentes
      const previousCompletedCount = steps.filter(
        (step) => step.isCompleted,
      ).length;
      setStats((prev) => ({
        ...prev,
        completedSteps: previousCompletedCount,
        progressPercentage:
          prev.totalSteps > 0
            ? Math.round((previousCompletedCount / prev.totalSteps) * 100)
            : 0,
      }));

      // Notification d'erreur
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la validation de l'étape",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données de progression au chargement du composant
  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Afficher un message d'erreur en haut si nécessaire, mais toujours afficher les étapes
  const errorMessage = error ? (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm mt-1 text-red-500">
            Erreur lors du chargement de la progression : {error}. Les étapes
            sont affichées avec leur état par défaut.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadProgressData}
          disabled={isLoading}
          className="mt-2 md:mt-0"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Réessayer
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parcours de la chasse</h2>

      {/* Affichage du message d'erreur si nécessaire */}
      {errorMessage}

      {/* Affichage de la progression et des statistiques */}
      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 flex-1">
            <h3 className="font-medium">Votre progression</h3>
            <div className="flex items-center gap-3">
              <Progress
                value={
                  stats.totalSteps > 0
                    ? (stats.completedSteps / stats.totalSteps) * 100
                    : 0
                }
                className="h-2"
              />
              <span className="text-sm font-medium">
                {stats.totalSteps > 0
                  ? Math.round((stats.completedSteps / stats.totalSteps) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.completedSteps}/{stats.totalSteps} étapes complétées
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalScore}</p>
              <p className="text-xs text-muted-foreground">Points gagnés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">
            Mise à jour en cours...
          </span>
        </div>
      )}

      {/* Liste des étapes avec validation - Toujours affichée */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = step.isCompleted || false;
          const completedAt = step.completedAt
            ? new Date(step.completedAt)
            : null;

          return (
            <Card
              key={step.id}
              className={`overflow-hidden transition-all ${
                isCompleted
                  ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800"
                  : ""
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {step.imageUrl && (
                  <div className="relative w-full md:w-48 h-40 flex-shrink-0">
                    <Image
                      src={step.imageUrl}
                      alt={step.title ?? `Étape ${step.stepOrder}`}
                      fill
                      className={`object-cover ${isCompleted ? "opacity-90" : ""}`}
                    />
                    {isCompleted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-grow flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span
                          className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium ${
                            isCompleted
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {step.stepOrder}
                        </span>
                        {step.title ?? `Étape ${step.stepOrder}`}
                      </CardTitle>
                      {isCompleted && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                        >
                          <Check className="mr-1 h-3 w-3" /> Validée
                        </Badge>
                      )}
                    </div>
                    {step.description && (
                      <CardDescription>{step.description}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="py-2">
                    {completedAt && (
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>
                          Validée le{" "}
                          {completedAt.toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 mt-auto">
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleStepCompletion(step.id)}
                      disabled={isLoading}
                      className={
                        isCompleted
                          ? "border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                          : ""
                      }
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isCompleted ? (
                        <XCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      {isCompleted
                        ? "Annuler validation"
                        : "Valider cette étape"}
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
