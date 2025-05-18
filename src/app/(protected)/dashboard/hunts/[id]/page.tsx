"use client";

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

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

export default function HuntDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const huntId = params.id;

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
      toast({
        title: "Chasse supprimée",
        description: "La chasse au trésor a été supprimée avec succès.",
      });
      router.push("/dashboard/hunts");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.message || "Une erreur s'est produite lors de la suppression.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">En attente</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-green-500">En cours</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Terminée</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Skeleton className="h-8 w-8 mr-4" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !hunt) {
    return (
      <div className="container py-10">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground">
            Impossible de charger les détails de cette chasse au trésor
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/hunts">Retour aux chasses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/hunts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/hunts/${huntId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer la chasse au trésor</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer cette chasse ? Cette action
                  est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
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
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">{hunt.title}</h1>
          {getStatusBadge(hunt.status)}
        </div>
        <p className="text-muted-foreground mt-2">
          Créée par {hunt.createdBy.name || hunt.createdBy.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {hunt.description || "Aucune description"}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">
                  Étapes ({hunt.steps.length})
                </h3>
                <div className="space-y-4">
                  {hunt.steps
                    .sort((a, b) => a.stepOrder - b.stepOrder)
                    .map((step) => (
                      <div key={step.id} className="bg-muted/50 p-4 rounded-md">
                        <div className="flex items-center mb-2">
                          <Badge variant="outline" className="mr-2">
                            Étape {step.stepOrder}
                          </Badge>
                        </div>
                        <p className="text-sm">{step.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
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

              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Lieu</p>
                  <p className="text-sm text-muted-foreground">
                    {hunt.location || "Non défini"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Participants</p>
                  <p className="text-sm text-muted-foreground">
                    {hunt.participants.length} participants
                  </p>
                </div>
              </div>

              {hunt.fee !== null && hunt.fee > 0 && (
                <div className="mt-2">
                  <Badge variant="secondary">
                    Frais de participation: {hunt.fee} couronnes
                  </Badge>
                </div>
              )}

              <div className="mt-2">
                <Badge variant={hunt.mode === "PUBLIC" ? "default" : "outline"}>
                  {hunt.mode === "PUBLIC" ? "Publique" : "Privée"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions card based on status */}
          {hunt.status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  La chasse est prête à être lancée. Vous pouvez la démarrer
                  quand vous le souhaitez.
                </p>
                <Button className="w-full">Démarrer la chasse</Button>
              </CardContent>
            </Card>
          )}

          {hunt.status === "IN_PROGRESS" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  La chasse est en cours. Vous pouvez la terminer quand tous les
                  participants ont fini.
                </p>
                <Button className="w-full">Terminer la chasse</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
