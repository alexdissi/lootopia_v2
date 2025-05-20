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
import { authClient } from "@/lib/auth-client";
import { Hunt } from "@/interfaces/hunt";
import HuntMapView from "./hunt-map-view";

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
      return res.json() as Promise<Hunt>;
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
