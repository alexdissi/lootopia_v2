"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Crown,
  Medal,
  Loader2,
  Award,
  Trophy,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntryType {
  id: string;
  userId: string;
  huntId: string;
  score: number;
  rank: number;
  completedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ProgressStats {
  totalScore: number;
  completedStepsCount: number;
  totalSteps: number;
  progressPercentage: number;
}

interface UserRankingType {
  data: LeaderboardEntryType | null;
  isRanked: boolean;
  progress: ProgressStats | null;
}

interface HuntLeaderboardProps {
  huntId: string;
}

export function HuntLeaderboard({ huntId }: HuntLeaderboardProps) {
  const { data: session } = authClient.useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryType[]>([]);
  const [userRanking, setUserRanking] = useState<UserRankingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger le classement
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/hunt/leaderboard?huntId=${huntId}`);

      if (!response.ok) {
        throw new Error(
          `Erreur lors du chargement du classement: ${response.status}`,
        );
      }

      const data = await response.json();
      setLeaderboard(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement du classement:", err);
      setError(
        "Impossible de charger le classement. Veuillez réessayer ultérieurement.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger le classement de l'utilisateur
  const fetchUserRanking = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/hunt/leaderboard/user?huntId=${huntId}&userId=${session.user.id}`,
      );

      if (!response.ok) {
        throw new Error(
          `Erreur lors du chargement du classement utilisateur: ${response.status}`,
        );
      }

      const data = await response.json();
      setUserRanking(data);
    } catch (err) {
      console.error(
        "Erreur lors du chargement du classement utilisateur:",
        err,
      );
      // Ne pas définir d'erreur ici pour ne pas perturber l'affichage du tableau principal
    }
  };

  // Charger les données au chargement du composant
  useEffect(() => {
    fetchLeaderboard();
    if (session?.user?.id) {
      fetchUserRanking();
    }
  }, [huntId, session?.user?.id]);

  // Fonction pour obtenir l'icône de médaille en fonction du rang
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <Award className="h-5 w-5 text-blue-500" />;
    }
  };

  // Fonction pour obtenir une couleur de fond en fonction du rang
  const getRankRowClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 dark:bg-yellow-950/20";
      case 2:
        return "bg-gray-50 dark:bg-gray-900/30";
      case 3:
        return "bg-amber-50 dark:bg-amber-950/20";
      default:
        return "";
    }
  };

  // Si on est en chargement
  if (isLoading && !leaderboard.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement du classement...</p>
      </div>
    );
  }

  // Si une erreur s'est produite
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchLeaderboard} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  // Si le classement est vide
  if (!leaderboard.length) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <TrendingUp className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">
          Aucun participant dans le classement
        </h3>
        <p className="text-muted-foreground mb-6">
          Soyez le premier à compléter des étapes pour apparaître dans le
          classement !
        </p>
        {session?.user && (
          <Button onClick={() => window.location.reload()}>
            Participer à la chasse
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="global">Classement Global</TabsTrigger>
          {userRanking && (
            <TabsTrigger value="your-progress">Ma Progression</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="global">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rang</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">
                    Date de complétion
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => {
                  const isCurrentUser = session?.user?.id === entry.userId;
                  return (
                    <TableRow
                      key={entry.id}
                      className={`${getRankRowClass(entry.rank)} ${isCurrentUser ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                    >
                      <TableCell className="text-center font-medium">
                        <div className="flex items-center justify-center">
                          {getRankIcon(entry.rank)}
                          <span className="ml-1.5">{entry.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {entry.user.image ? (
                              <AvatarImage
                                src={entry.user.image}
                                alt={entry.user.name || "Utilisateur"}
                              />
                            ) : (
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className={isCurrentUser ? "font-medium" : ""}>
                            {entry.user.name || "Utilisateur anonyme"}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary">
                                (Vous)
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {entry.score} pts
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(entry.completedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {userRanking && (
          <TabsContent value="your-progress">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Votre Progression</span>
                  {userRanking.isRanked && (
                    <Badge variant="outline" className="ml-2 px-3 py-1">
                      <Crown className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                      Rang {userRanking.data?.rank || "-"}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Détails de votre parcours dans cette chasse au trésor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userRanking.progress ? (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-medium">Score actuel</p>
                          <p className="text-2xl font-bold">
                            {userRanking.progress.totalScore} points
                          </p>
                        </div>
                        <Badge className="px-3 py-1">
                          {userRanking.progress.completedStepsCount} /{" "}
                          {userRanking.progress.totalSteps} étapes
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progression</span>
                          <span>
                            {userRanking.progress.progressPercentage}%
                          </span>
                        </div>
                        <Progress
                          value={userRanking.progress.progressPercentage}
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">
                        Détails de complétion
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-md border p-3">
                          <p className="text-xs text-muted-foreground">
                            Étapes complétées
                          </p>
                          <p className="text-lg font-bold">
                            {userRanking.progress.completedStepsCount}
                          </p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-xs text-muted-foreground">
                            Points par étape
                          </p>
                          <p className="text-lg font-bold">10 pts</p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-xs text-muted-foreground">
                            Étapes restantes
                          </p>
                          <p className="text-lg font-bold">
                            {userRanking.progress.totalSteps -
                              userRanking.progress.completedStepsCount}
                          </p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-xs text-muted-foreground">
                            Points potentiels
                          </p>
                          <p className="text-lg font-bold">
                            {(userRanking.progress.totalSteps -
                              userRanking.progress.completedStepsCount) *
                              10}{" "}
                            pts
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Vous n&apos;avez pas encore commencé cette chasse au
                      trésor.
                    </p>
                    <Button className="mt-4" size="sm">
                      Commencer la chasse
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
