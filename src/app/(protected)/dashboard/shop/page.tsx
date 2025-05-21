import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/db";
import { ShopItemsContainer } from "@/components/context/shop/shop-items-container";
import { UserInventory } from "@/components/context/shop/shop-items-inventory";
import { ShopHeader } from "@/components/context/shop/shop-header";

export default async function ShopPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userCurrency = await prisma.virtualCurrency.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  const crownBalance = userCurrency?.amount || 0;

  return (
    <div className="container py-10">
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Boutique d'Objets</CardTitle>
          <CardDescription>
            Utilisez vos couronnes pour acheter des avantages et des objets
            spéciaux
          </CardDescription>
        </CardHeader>
      </Card>

      <ShopHeader crownBalance={crownBalance} />

      <Tabs defaultValue="shop" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shop">Boutique</TabsTrigger>
          <TabsTrigger value="inventory">Mon Inventaire</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="mt-6">
          <Suspense fallback={<div>Chargement des articles...</div>}>
            <ShopItemsContainer userId={session.user.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <Suspense fallback={<div>Chargement de votre inventaire...</div>}>
            <UserInventory userId={session.user.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
