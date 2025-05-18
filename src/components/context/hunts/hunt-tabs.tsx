"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHunts } from "@/hooks/use-hunts";
import { HuntsFilters } from "./hunt-filters";
import { HuntsList } from "./hunt-list";
import { authClient } from "@/lib/auth-client";
import { UserRole } from "@/interfaces/user";

export function HuntsTabs() {
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const session = authClient.useSession();

  // @ts-ignore
  const userRole = session?.data?.roles.role;
  console.log("User role:", userRole);
  const canCreateHunt =
    userRole === UserRole.ORGANIZER || userRole === UserRole.ADMIN;
  const {
    allHunts,
    myHunts,
    isLoadingAll,
    isLoadingMine,
    error: huntsError,
  } = useHunts(statusFilter);

  const filterHunts = (hunts: any[] | undefined) => {
    if (!hunts) return [];
    return hunts.filter(
      (hunt) =>
        hunt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hunt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hunt.location?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const filteredAllHunts = filterHunts(allHunts);
  const filteredMyHunts = filterHunts(myHunts);

  if (huntsError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Une erreur s'est produite</h2>
        <p className="text-muted-foreground mb-4">
          Impossible de charger les chasses au trésor.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Rafraîchir la page
        </button>
      </div>
    );
  }

  return (
    <>
      <HuntsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Toutes les chasses</TabsTrigger>
          {canCreateHunt && <TabsTrigger value="mine">Mes chasses</TabsTrigger>}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <HuntsList
            hunts={filteredAllHunts}
            isLoading={isLoadingAll}
            emptyMessage="Aucune chasse au trésor trouvée"
            showEditButton={false}
          />
        </TabsContent>
        {canCreateHunt && (
          <TabsContent value="mine" className="space-y-4">
            <HuntsList
              hunts={filteredMyHunts}
              isLoading={isLoadingMine}
              emptyMessage="Vous n'avez pas encore créé de chasse au trésor"
              emptyAction="/dashboard/hunts/create"
              emptyActionLabel="Créer ma première chasse"
              showEditButton={true}
            />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}
