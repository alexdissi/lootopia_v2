"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTransactionsTab } from "@/components/context/users/user-transaction-history";
import { Suspense } from "react";

interface ProfileTabsProps {
  defaultTab: string;
  userId: string;
}

export function ProfileTabs({ defaultTab, userId }: ProfileTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (value: string) => {
    router.replace(`${pathname}?tab=${value}`, { scroll: false });
  };

  return (
    <Tabs defaultValue={defaultTab} onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="info">Informations</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="artefacts">Artefacts</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <p>Informations utilisateur...</p>
      </TabsContent>

      <TabsContent value="transactions">
        <Suspense fallback={<div>Chargement des transactions...</div>}>
          <UserTransactionsTab userId={userId} />
        </Suspense>
      </TabsContent>

      <TabsContent value="artefacts">
        <p>Artefacts utilisateur...</p>
      </TabsContent>
    </Tabs>
  );
}
