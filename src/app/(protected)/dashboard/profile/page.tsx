import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { ProfileTabs } from "./profil-tabs";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return notFound();
  }

  const { tab } = (await searchParams) as { tab: string };
  const activeTab = ["info", "transactions", "artefacts"].includes(tab)
    ? tab
    : "info";

  return (
    <Suspense fallback={<div>Chargement du contenu...</div>}>
      <ProfileTabs defaultTab={activeTab} userId={session.user.id} />
    </Suspense>
  );
}
