"use client";

import { useState, useRef, useEffect } from "react";
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
  Info,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Share2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import { HuntDetailsSkeleton } from "@/components/context/hunts/hunt-detail-skeleton";
import { authClient } from "@/lib/auth-client";
import { MapView } from "@/components/ui/maps";

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
  const [activeTab, setActiveTab] = useState("details");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { data: session } = authClient.useSession();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Lien copié dans le presse-papiers");
      setIsShareDialogOpen(false);
    });
  };

  if (isLoading) {
    return <HuntDetailsSkeleton />;
  }

  const isCreator = hunt?.createdBy?.email === session?.user?.email;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "IN_PROGRESS":
        return <Flag className="h-5 w-5 text-green-500" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case "CANCELLED":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getProgressPercentage = () => {
    switch (hunt.status) {
      case "PENDING":
        return 25;
      case "IN_PROGRESS":
        return 65;
      case "COMPLETED":
        return 100;
      case "CANCELLED":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <>
      <div
        ref={headerRef}
        className={cn(
          "sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b transition-all duration-300 ease-in-out",
          headerVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="container py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href="/dashboard/hunts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="font-medium truncate max-w-[200px] sm:max-w-xs">
              {hunt.title}
            </h2>
            <StatusBadge status={hunt.status} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(
                  isBookmarked ? "Retiré des favoris" : "Ajouté aux favoris",
                );
              }}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {isCreator && (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href={`/dashboard/hunts/${huntId}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {hunt.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${hunt.createdBy.email}`}
                  />
                  <AvatarFallback>
                    {hunt.createdBy.name?.charAt(0) ||
                      hunt.createdBy.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  Créée par {hunt.createdBy.name || hunt.createdBy.email}
                </span>
              </div>
            </div>

            {isCreator && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="self-start"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>

          <div className="w-full mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5">
                {getStatusIcon(hunt.status)}
                <span className="font-medium">
                  {hunt.status === "PENDING" && "En attente"}
                  {hunt.status === "IN_PROGRESS" && "En cours"}
                  {hunt.status === "COMPLETED" && "Terminée"}
                  {hunt.status === "CANCELLED" && "Annulée"}
                </span>
              </div>

              <Separator orientation="vertical" className="h-4" />

              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {hunt.participants.length} participant
                  {hunt.participants.length !== 1 ? "s" : ""}
                </span>
              </div>

              {hunt.fee !== null && hunt.fee > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">{hunt.fee} couronnes</span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                {hunt.mode === "PUBLIC" ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-green-500/10 text-green-600 border-green-200"
                  >
                    <Globe className="h-3 w-3" />
                    <span>Publique</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border-amber-200"
                  >
                    <Lock className="h-3 w-3" />
                    <span>Privée</span>
                  </Badge>
                )}
              </div>
            </div>

            <Progress value={getProgressPercentage()} className="h-1.5" />
          </div>
        </div>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 w-full">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="steps">
              Étapes ({hunt.steps.length})
            </TabsTrigger>
            <TabsTrigger value="map">Carte</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/5 border-b backdrop-blur-sm">
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground whitespace-pre-line">
                  {hunt.description ||
                    "Aucune description fournie pour cette chasse au trésor."}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/5 border-b backdrop-blur-sm">
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">
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
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Créée le</p>
                      <p className="text-muted-foreground">
                        {format(new Date(hunt.createdAt), "PPP", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-muted-foreground">
                        {hunt.location || "Non défini"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-muted-foreground">
                        {hunt.participants.length} participant
                        {hunt.participants.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {hunt.status === "PENDING" && isCreator && (
              <Card className="overflow-hidden border-muted/30 shadow-md">
                <CardHeader className="bg-gradient-to-r from-muted/10 to-background border-b border-muted/20">
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Actions
                  </CardTitle>
                  <CardDescription>
                    La chasse est prête à être lancée
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
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

            {hunt.status === "IN_PROGRESS" && isCreator && (
              <Card className="overflow-hidden border-green-500/20 shadow-md">
                <CardHeader className="bg-green-500/10 border-b border-green-500/20">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Actions
                  </CardTitle>
                  <CardDescription>La chasse est en cours</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm mb-4">
                    Vous pouvez terminer la chasse quand tous les participants
                    ont fini.
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
              <Card className="overflow-hidden border-muted/30 shadow-md">
                <CardHeader className="bg-gradient-to-r from-muted/10 to-background border-b border-muted/20">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Chasse terminée
                  </CardTitle>
                  <CardDescription>Cette chasse est terminée</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm mb-4">
                    Cette chasse au trésor est terminée. Vous pouvez consulter
                    les résultats et les statistiques.
                  </p>
                  <Button variant="outline" className="w-full">
                    Voir les résultats
                  </Button>
                </CardContent>
              </Card>
            )}

            {hunt.status === "CANCELLED" && (
              <Card className="overflow-hidden border-destructive/20 shadow-md">
                <CardHeader className="bg-destructive/10 border-b border-destructive/20">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Chasse annulée
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm">
                    Cette chasse au trésor a été annulée et n'est plus
                    disponible pour les participants.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="steps">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/5 border-b backdrop-blur-sm">
                <CardTitle className="flex items-center justify-between">
                  <span>Étapes de la chasse</span>
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
                </CardTitle>
              </CardHeader>
              <CardContent
                className={cn(
                  "transition-all p-0",
                  expandedSteps ? "block" : "hidden",
                )}
              >
                <ScrollArea className="h-[500px]">
                  {hunt.steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <Flag className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground text-center">
                        Aucune étape définie pour cette chasse.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-8 pr-4 py-6">
                      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

                      {hunt.steps
                        .sort((a, b) => a.stepOrder - b.stepOrder)
                        .map((step, index) => (
                          <div
                            key={step.id}
                            className="relative mb-6 last:mb-0"
                          >
                            <div className="absolute left-[-24px] flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 z-10">
                              <span className="font-semibold text-primary">
                                {step.stepOrder}
                              </span>
                            </div>
                            <div className="ml-6 bg-muted/10 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                              <div className="flex items-center mb-2">
                                <Badge variant="outline" className="mr-2">
                                  Étape {step.stepOrder}
                                </Badge>
                              </div>
                              <p className="text-sm whitespace-pre-line">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            {hunt.location ? (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <MapView
                  location={hunt.location}
                  height="70vh"
                  className="w-full"
                  zoom={14}
                />
              </div>
            ) : (
              <Card className="overflow-hidden border-none shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Aucune localisation
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Cette chasse au trésor n'a pas de localisation définie.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager cette chasse au trésor</DialogTitle>
            <DialogDescription>
              Partagez cette chasse au trésor avec vos amis et votre famille.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between rounded-md border p-4">
                <p className="text-sm font-medium truncate max-w-[180px] sm:max-w-[280px]">
                  {window.location.href}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  Copier
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  );
                  setIsShareDialogOpen(false);
                }}
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </div>
                <span className="text-xs">Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2"
                onClick={() => {
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(`Découvre cette chasse au trésor: ${hunt.title} - ${window.location.href}`)}`,
                    "_blank",
                  );
                  setIsShareDialogOpen(false);
                }}
              >
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.5 14.5 14 13l-1 1c-1 1-3 1-5-1s-2-4-1-5l1-1-1.5-3.5c-1.5 1-2.5 2-3 3.5-.5 1.5 0 3.5 2 5.5s4 2.5 5.5 2c1.5-.5 2.5-1.5 3.5-3Z"></path>
                    <path d="M14.5 17.5c1.5.5 3.5 0 5.5-2s2.5-4 2-5.5c-.5-1.5-1.5-2.5-3-3.5l-3.5 1.5 1 1c1 1 1 3-1 5s-4 2-5 1l-1-1-1.5 3.5"></path>
                  </svg>
                </div>
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvre cette chasse au trésor: ${hunt.title}`)}&url=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  );
                  setIsShareDialogOpen(false);
                }}
              >
                <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </div>
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2"
                onClick={() => {
                  window.open(`https://www.instagram.com/`, "_blank");
                  toast.info(
                    "Instagram ne permet pas le partage direct via lien. Copiez le lien et partagez-le manuellement.",
                  );
                  setIsShareDialogOpen(false);
                }}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </div>
                <span className="text-xs">Instagram</span>
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="secondary"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 border-amber-200"
        >
          En attente
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="text-xs px-2 py-0.5 bg-green-500 border-green-600 text-white">
          En cours
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 bg-muted/20 text-foreground border-muted/30"
        >
          Terminée
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="text-xs px-2 py-0.5">
          Annulée
        </Badge>
      );
    default:
      return <Badge className="text-xs px-2 py-0.5">{status}</Badge>;
  }
}
