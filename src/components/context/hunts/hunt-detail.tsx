"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HuntDetailsSkeleton } from "./hunt-detail-skeleton";
import { HuntHeader } from "./hunt-header";
import { HuntInfoCard } from "./hunt-info-card";
import { HuntStatusSection } from "./hunt-status-section";
import { HuntStepsList } from "./hunt-steps-list";
import { HuntShareDialog } from "./hunt-share-dialog";
import { HuntDeleteDialog } from "./hunt-delete-dialog";
import { HuntJoinButton } from "./hunt-join-button";
import { authClient } from "@/lib/auth-client";
import { Hunt } from "@/interfaces/hunt";
import HuntMapView from "./hunt-map-view";

interface Participant {
  userId: string;
  huntId: string;
  status?: string;
  [key: string]: any;
}

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
      return res.json() as Promise<Hunt & { participants?: Participant[] }>;
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
      hunt.participants?.some((p) => p.userId === session?.data?.user.id),
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
          <TabsList className="grid grid-cols-3 mb-6 w-full">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="steps">
              Étapes ({hunt.steps?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="map">Carte</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <HuntInfoCard hunt={hunt} />

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
              <HuntStatusSection
                hunt={hunt}
                isCreator={isCreator}
                onRefetch={refetch}
              />
            )}
          </TabsContent>

          <TabsContent value="steps">
            <HuntStepsList steps={hunt.steps || []} />
          </TabsContent>

          <TabsContent value="map">
            <HuntMapView hunt={hunt} />
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
