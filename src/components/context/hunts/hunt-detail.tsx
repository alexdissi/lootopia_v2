"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hunt } from "@/interfaces/hunt";
import { authClient } from "@/lib/auth-client";
import { HuntDeleteDialog } from "./hunt-delete-dialog";
import { HuntDetailsSkeleton } from "./hunt-detail-skeleton";
import { HuntHeader } from "./hunt-header";
import { HuntInfoCard } from "./hunt-info-card";
import { HuntJoinButton } from "./hunt-join-button";
import HuntMapView from "./hunt-map-view";
import { HuntShareDialog } from "./hunt-share-dialog";
import { HuntStatusSection } from "./hunt-status-section";
import { HuntStepsList } from "./hunt-steps-list";
import { ReviewForm } from "./form/hunt-review-form";
import { ReviewList } from "@/components/review/review-list";

type ParticipantUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
};

type Participant = {
  userId: string;
  huntId: string;
  status?: string;
  user?: ParticipantUser;
};

type HuntWithParticipants = Hunt & {
  participants?: Array<Participant>;
};

export function HuntDetails({ huntId }: { huntId: string }) {
  const [activeTab, setActiveTab] = useState("details");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const session = authClient.useSession();

  const {
    data: hunt,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hunt", huntId],
    queryFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}`);
      if (!res.ok) throw new Error("Failed to fetch hunt details");
      return res.json() as Promise<HuntWithParticipants>;
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
        </div>
      </div>
    );
  }

  const isCreator = hunt?.createdBy?.email === session?.data?.user?.email;
  const isParticipant = Boolean(
    session?.data?.user?.id &&
      hunt.participants?.some((p) => p.userId === session?.data?.user?.id),
  );

  return (
    <>
      <HuntHeader
        hunt={hunt}
        isCreator={isCreator}
        isBookmarked={isBookmarked}
        setIsBookmarked={setIsBookmarked}
        onShare={() => setIsShareDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <div className="container py-6">
        {!isCreator && !isParticipant && hunt.status !== "COMPLETED" && (
          <div className="mb-6">
            <HuntJoinButton
              huntId={hunt.id}
              fee={hunt.fee}
              className="w-full sm:w-auto"
            />
          </div>
        )}

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6 w-full">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="steps">
              Étapes ({hunt.steps?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="map">Carte</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <HuntInfoCard hunt={hunt as any} />

            {!isCreator && !isParticipant && hunt.status !== "COMPLETED" && (
              <div className="mt-6 p-6 border rounded-lg bg-muted/5">
                <h3 className="text-lg font-medium mb-2">
                  Rejoindre cette aventure
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {hunt.fee && hunt.fee > 0
                    ? `La participation à cette chasse coûte ${hunt.fee} pièces.`
                    : "Cette chasse au trésor est gratuite !"}
                </p>
                <HuntJoinButton
                  huntId={hunt.id}
                  fee={hunt.fee}
                  className="w-full sm:w-auto"
                />
              </div>
            )}

            {isParticipant && (
              <div className="mt-4 p-4 border rounded-lg bg-primary/5">
                <p className="text-sm font-medium text-primary">
                  Vous participez déjà à cette chasse au trésor !
                </p>
              </div>
            )}

            {isCreator && (
              <>
                <HuntStatusSection
                  hunt={hunt}
                  isCreator={isCreator}
                  onRefetch={refetch}
                />

                {/* Liste des participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hunt.participants && hunt.participants.length > 0 ? (
                      <div className="space-y-4">
                        {(hunt.participants as Participant[]).map(
                          (participant) => {
                            const participantStatus =
                              participant.status || "PENDING";
                            const user = participant.user || {};

                            return (
                              <div
                                key={participant.userId}
                                className="flex items-center justify-between p-2 bg-muted/10 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={user.image || ""}
                                      alt={user.name || "Participant"}
                                    />
                                    <AvatarFallback>
                                      {user.name
                                        ? user.name
                                            .substring(0, 1)
                                            .toUpperCase()
                                        : "P"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {user.name || "Participant inconnu"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {user.email || ""}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    participantStatus === "COMPLETED"
                                      ? "outline"
                                      : "secondary"
                                  }
                                  className={
                                    participantStatus === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : participantStatus === "ONGOING"
                                        ? "bg-blue-100 text-blue-800"
                                        : ""
                                  }
                                >
                                  {participantStatus === "COMPLETED"
                                    ? "Terminé"
                                    : participantStatus === "ONGOING"
                                      ? "En cours"
                                      : "Inscrit"}
                                </Badge>
                              </div>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Aucun participant pour le moment
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="steps">
            <HuntStepsList steps={hunt.steps || []} />
          </TabsContent>

          <TabsContent value="map">
            <HuntMapView hunt={hunt} />
          </TabsContent>
          <TabsContent value="reviews">
            <div className="space-y-6">
              {session?.data?.user && <ReviewForm huntId={hunt.id} />}

              <ReviewList huntId={hunt.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <HuntShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        hunt={hunt}
      />

      <HuntDeleteDialog
        huntId={huntId}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
