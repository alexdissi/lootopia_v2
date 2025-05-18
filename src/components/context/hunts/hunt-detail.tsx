"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Crown,
  Lock,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { HuntDetailsSkeleton } from "@/components/context/hunts/hunt-detail-skeleton";

interface Step {
  id: string;
  description: string;
  stepOrder: number;
}

interface HuntDetails {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  mode: "PUBLIC" | "PRIVATE";
  fee: number | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  steps: Step[];
  createdBy: {
    name: string | null;
    email: string;
  };
  participants: {
    id: string;
    userId: string;
    status: string;
  }[];
}

export function HuntDetails({ huntId }: { huntId: string }) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(true);

  const {
    data: hunt,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hunt", huntId],
    queryFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}`);
      if (!res.ok) throw new Error("Failed to fetch hunt details");
      return res.json() as Promise<HuntDetails>;
    },
  });

  const deleteHuntMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete hunt");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("La chasse au trésor a été supprimée avec succès.");
      router.push("/dashboard/hunts");
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Une erreur s'est produite lors de la suppression.",
      );
    },
  });

  const startHuntMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}/start`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to start hunt");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("La chasse au trésor a été démarrée avec succès.");
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Une erreur s'est produite lors du démarrage.",
      );
    },
  });

  const completeHuntMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to complete hunt");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("La chasse au trésor a été terminée avec succès.");
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Une erreur s'est produite lors de la finalisation.",
      );
    },
  });

  if (isLoading) {
    return <HuntDetailsSkeleton />;
  }

  if (error || !hunt) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-6">
            Impossible de charger les détails de cette chasse au trésor
          </p>
          <Button asChild>
            <Link href="/dashboard/hunts">Retour aux chasses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/dashboard/hunts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/hunts/${huntId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">{hunt.title}</h1>
          <StatusBadge status={hunt.status} />
        </div>
        <p className="text-muted-foreground">
          Créée par {hunt.createdBy.name || hunt.createdBy.email}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {hunt.description ||
                  "Aucune description fournie pour cette chasse au trésor."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
              <CardTitle>Étapes ({hunt.steps.length})</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSteps(!expandedSteps)}
                className="h-8 w-8 p-0"
              >
                {expandedSteps ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent
              className={cn(
                "transition-all",
                expandedSteps ? "block" : "hidden",
              )}
            >
              <div className="space-y-4">
                {hunt.steps.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune étape définie pour cette chasse.
                  </p>
                ) : (
                  hunt.steps
                    .sort((a, b) => a.stepOrder - b.stepOrder)
                    .map((step) => (
                      <div
                        key={step.id}
                        className="bg-muted/30 p-4 rounded-lg border border-border/50"
                      >
                        <div className="flex items-center mb-2">
                          <Badge variant="outline" className="mr-2">
                            Étape {step.stepOrder}
                          </Badge>
                        </div>
                        <p className="text-sm">{step.description}</p>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {hunt.startDate ? (
                      <>
                        {format(new Date(hunt.startDate), "PPP", {
                          locale: fr,
                        })}
                        {hunt.endDate && (
                          <>
                            {" "}
                            -{" "}
                            {format(new Date(hunt.endDate), "PPP", {
                              locale: fr,
                            })}
                          </>
                        )}
                      </>
                    ) : (
                      "Non définie"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Créée le</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(hunt.createdAt), "PPP", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Lieu</p>
                  <p className="text-sm text-muted-foreground">
                    {hunt.location || "Non défini"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Participants</p>
                  <p className="text-sm text-muted-foreground">
                    {hunt.participants.length} participant
                    {hunt.participants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                {hunt.fee !== null && hunt.fee > 0 && (
                  <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded-full text-sm">
                    <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    <span>{hunt.fee} couronnes</span>
                  </div>
                )}

                <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded-full text-sm">
                  {hunt.mode === "PUBLIC" ? (
                    <>
                      <Globe className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                      <span>Publique</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                      <span>Privée</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions card based on status */}
          {hunt.status === "PENDING" && (
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  La chasse est prête à être lancée
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm mb-4">
                  Vous pouvez démarrer la chasse quand vous êtes prêt. Les
                  participants pourront alors commencer.
                </p>
                <Button
                  className="w-full"
                  onClick={() => startHuntMutation.mutate()}
                  disabled={startHuntMutation.isPending}
                >
                  {startHuntMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Démarrer la chasse
                </Button>
              </CardContent>
            </Card>
          )}

          {hunt.status === "IN_PROGRESS" && (
            <Card className="border-green-500/20">
              <CardHeader className="bg-green-500/5 pb-4">
                <CardTitle>Actions</CardTitle>
                <CardDescription>La chasse est en cours</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm mb-4">
                  Vous pouvez terminer la chasse quand tous les participants ont
                  fini.
                </p>
                <Button
                  className="w-full"
                  onClick={() => completeHuntMutation.mutate()}
                  disabled={completeHuntMutation.isPending}
                >
                  {completeHuntMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Terminer la chasse
                </Button>
              </CardContent>
            </Card>
          )}

          {hunt.status === "COMPLETED" && (
            <Card className="border-secondary/20">
              <CardHeader className="bg-secondary/5 pb-4">
                <CardTitle>Chasse terminée</CardTitle>
                <CardDescription>Cette chasse est terminée</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm">
                  Cette chasse au trésor est terminée. Vous pouvez consulter les
                  résultats et les statistiques.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Voir les résultats
                </Button>
              </CardFooter>
            </Card>
          )}

          {hunt.status === "CANCELLED" && (
            <Card className="border-destructive/20">
              <CardHeader className="bg-destructive/5 pb-4">
                <CardTitle>Chasse annulée</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm">
                  Cette chasse au trésor a été annulée et n'est plus disponible
                  pour les participants.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la chasse au trésor</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette chasse ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteHuntMutation.mutate()}
              disabled={deleteHuntMutation.isPending}
            >
              {deleteHuntMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="text-xs md:text-sm px-2 md:px-3 py-1"
        >
          En attente
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-green-500 text-xs md:text-sm px-2 md:px-3 py-1">
          En cours
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="secondary"
          className="text-xs md:text-sm px-2 md:px-3 py-1"
        >
          Terminée
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="destructive"
          className="text-xs md:text-sm px-2 md:px-3 py-1"
        >
          Annulée
        </Badge>
      );
    default:
      return (
        <Badge className="text-xs md:text-sm px-2 md:px-3 py-1">{status}</Badge>
      );
  }
}
