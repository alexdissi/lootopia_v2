import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useHuntProgress } from "@/hooks/use-hunt-progress";
import { Badge } from "@/components/ui/badge";

interface LocationType {
  latitude: number;
  longitude: number;
  address?: string;
}

interface HuntStepType {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  stepOrder: number;
  location?: LocationType;
  createdAt?: string;
}

interface ProgressStepType {
  id: string;
  description?: string;
  stepOrder: number;
  title?: string;
  imageUrl?: string;
  isCompleted: boolean;
  completedAt: string | null;
  location?: LocationType;
}

interface HuntStepsListProps {
  steps: HuntStepType[];
  huntId?: string;
  isParticipant?: boolean;
}

export function HuntStepsList({ steps, huntId, isParticipant = false }: Readonly<HuntStepsListProps>) {
  // Log pour débogage
  console.log("HuntStepsList - Props reçues:", { 
    stepsCount: steps.length, 
    huntId, 
    isParticipant 
  });
  
  // Si l'utilisateur n'est pas participant, on affiche simplement la liste des étapes
  if (!isParticipant || !huntId) {
    console.log("HuntStepsList - Affichage en mode simple (non participant)");
    return <SimpleStepsList steps={steps} />;
  }

  // Si l'utilisateur est participant, on utilise le hook pour suivre la progression
  console.log("HuntStepsList - Affichage en mode participant avec progression");
  return <ParticipantStepsList steps={steps} huntId={huntId} />;
}

// Version simplifiée pour les non-participants
function SimpleStepsList({ steps }: Readonly<{ steps: HuntStepType[] }>) {
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parcours de la chasse</h2>
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
                        {index + 1}
                      </span>
                      {step.title ?? `Étape ${index + 1}`}
                    </div>
                  </CardTitle>
                  {step.description && (
                    <CardDescription>{step.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {step.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {step.location.address ??
                          `${step.location.latitude}, ${step.location.longitude}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Version enrichie pour les participants avec suivi de progression
function ParticipantStepsList({ steps: initialSteps, huntId }: Readonly<{ steps: HuntStepType[], huntId: string }>) {
  const {
    steps,
    totalSteps,
    completedSteps,
    progressPercentage,
    totalScore,
    isLoading,
    isError,
    error,
    toggleStepCompletion,
  } = useHuntProgress(huntId);
  
  console.log("ParticipantStepsList - Progress data:", { 
    steps, 
    isLoading, 
    isError, 
    error,
    initialStepsCount: initialSteps.length
  });
  
  // Si une erreur s'est produite lors du chargement des données de progression
  // mais que nous avons des étapes initiales, utilisons-les pour afficher quand même les étapes
  if (isError && initialSteps.length > 0) {
    console.log("ParticipantStepsList - Using initialSteps due to API error:", error);
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Parcours de la chasse</h2>
            <p className="text-muted-foreground text-sm mt-1 text-red-500">
              Erreur lors du chargement de la progression : {error instanceof Error ? error.message : "Erreur inconnue"}. 
              Veuillez réessayer ultérieurement.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mt-2 md:mt-0"
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Recharger la page
          </Button>
        </div>
        
        <div className="space-y-4">
          {initialSteps.map((step, index) => (
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
                          {index + 1}
                        </span>
                        {step.title ?? `Étape ${index + 1}`}
                      </div>
                    </CardTitle>
                    {step.description && (
                      <CardDescription>{step.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {step.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {step.location.address ??
                            `${step.location.latitude}, ${step.location.longitude}`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (isLoading && steps.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Parcours de la chasse</h2>
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }
  
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold">Parcours de la chasse</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Cochez les étapes au fur et à mesure de votre progression
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-2">
          <Badge variant="secondary" className="px-4 py-1 text-sm">
            Score: <span className="font-bold">{totalScore} points</span>
          </Badge>
          <div className="flex flex-col gap-1 w-full md:w-60">
            <div className="flex justify-between text-xs">
              <span>{completedSteps} / {totalSteps} étapes</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {steps.map((step) => (
          <Card 
            key={step.id} 
            className={`overflow-hidden transition-colors ${
              step.isCompleted ? "border-green-200 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900/30" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {step.imageUrl && (
                <div className="relative w-full md:w-48 h-40 flex-shrink-0">
                  <Image
                    src={step.imageUrl}
                    alt={step.title ?? `Étape ${step.stepOrder}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-grow flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium ${
                        step.isCompleted 
                          ? "bg-green-500 text-white" 
                          : "bg-primary/10 text-primary"
                      }`}>
                        {step.stepOrder}
                      </span>
                      {step.title ?? `Étape ${step.stepOrder}`}
                    </div>
                    {step.isCompleted && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                        Validée
                      </Badge>
                    )}
                  </CardTitle>
                  {step.description && (
                    <CardDescription>{step.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  {/* Emplacement géographique - ignoré pour les étapes en progression */}
                </CardContent>
                <CardFooter className="pt-0 pb-2 flex justify-end">
                  <Button
                    variant={step.isCompleted ? "outline" : "default"}
                    size="sm"
                    className={step.isCompleted ? "border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-950" : ""}
                    onClick={() => toggleStepCompletion(step.id, step.isCompleted)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : step.isCompleted ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Annuler la validation
                      </>
                    ) : (
                      "Valider cette étape"
                    )}
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
