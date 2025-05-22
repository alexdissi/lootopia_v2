import { Suspense } from "react";
import { HuntDetails } from "@/components/context/hunts/hunt-detail";
import { HuntDetailsSkeleton } from "@/components/context/hunts/hunt-detail-skeleton";

export default async function HuntDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container py-6 md:py-10">
      <Suspense fallback={<HuntDetailsSkeleton />}>
        <HuntDetails huntId={id} />
      </Suspense>
    </div>
  );
}
