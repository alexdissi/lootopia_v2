import { MapPin } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepList } from "./step-list";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface HuntStepsListProps {
  steps: HuntStepType[];
  huntId: string;
}

export function HuntStepsList({ steps, huntId }: HuntStepsListProps) {
  const session = authClient.useSession();
  const userId = session?.data?.user?.id;

  // Récupérer la participation de l'utilisateur pour cette chasse
  const {
    data: participation,
    isLoading: isLoadingParticipation,
    error: participationError,
  } = useQuery({
    queryKey: ["participation", huntId, userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const res = await fetch(
          `/api/hunt/${huntId}/participation?userId=${userId}`,
        );
        if (!res.ok) {
          if (res.status === 404) return null;
          // Récupérer les détails de l'erreur si disponibles
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              "Erreur lors de la vérification de la participation",
          );
        }
        return res.json();
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de la participation:",
          error,
        );
        throw error;
      }
    },
    enabled: !!userId && !!huntId,
    retry: 1, // Limiter les tentatives de réessai
    retryDelay: 1000, // Attendre 1 seconde avant de réessayer
  });

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucune étape n&apos;a été définie pour cette chasse au trésor.
        </p>
      </div>
    );
  }

  // Affichage pour les visiteurs non participants
  if (!participation && !isLoadingParticipation && userId) {
    // Afficher un message d'erreur si la vérification de participation a échoué
    if (participationError) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Parcours de la chasse</h2>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {participationError instanceof Error
                ? participationError.message
                : "Erreur lors de la vérification de votre participation. Veuillez réessayer plus tard."}
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
          <div className="space-y-4 opacity-70">
            {steps.map((step, index) => (
              <Card key={step.id} className="overflow-hidden bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    {step.title || `Étape ${index + 1}`}
                  </CardTitle>
                  <CardDescription>Détails non disponibles</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Parcours de la chasse</h2>
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez rejoindre cette chasse au trésor pour voir les étapes en
            détail et suivre votre progression.
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={step.id} className="overflow-hidden bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  {step.title || `Étape ${index + 1}`}
                </CardTitle>
                <CardDescription>
                  Rejoignez la chasse pour voir les détails
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Si l'utilisateur participe à la chasse, afficher le composant StepList pour validation
  if (participation) {
    return <StepList steps={steps} huntId={huntId} isParticipant={true} />;
  }

  // Affichage par défaut (pour les visiteurs non connectés ou l'organisateur)
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
                    alt={step.title || `Étape ${index + 1}`}
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
                      {step.title || `Étape ${index + 1}`}
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
                        {step.location.address ||
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
