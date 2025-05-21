import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { headers } from "next/headers";
import { ProfileTabs } from "./profil-tabs";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return notFound();
  }

  const tab = searchParams.tab || "info";
  const activeTab = ["info", "transactions", "artefacts"].includes(tab)
    ? tab
    : "info";

  return (
    <div className="container py-10">
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Profil Utilisateur</CardTitle>
          <CardDescription>
            Gérez votre profil et consultez votre historique
          </CardDescription>
        </CardHeader>
      </Card>

      <Suspense fallback={<div>Chargement du contenu...</div>}>
        <ProfileTabs defaultTab={activeTab} userId={session.user.id} />
      </Suspense>
    </div>
  );
}
