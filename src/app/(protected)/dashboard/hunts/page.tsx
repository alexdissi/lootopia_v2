import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HuntsTabsSkeleton } from "@/components/context/hunts/hunt-skeleton";
import { HuntsTabs } from "@/components/context/hunts/hunt-tabs";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserRole } from "../../../../../generated/prisma";

export const metadata: Metadata = {
  title: "Chasses au trésor",
  description: "Gérez vos chasses au trésor ici",
};

export default async function HuntsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userRole = session?.user?.role as UserRole;
  const canCreateHunt =
    userRole === UserRole.ORGANIZER || userRole === UserRole.ADMIN;

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Chasses au trésor</h1>
        {canCreateHunt && (
          <Link href="/dashboard/hunts/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer une chasse
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<HuntsTabsSkeleton />}>
        <HuntsTabs />
      </Suspense>
    </div>
  );
}
