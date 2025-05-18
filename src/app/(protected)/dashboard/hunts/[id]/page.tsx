import { Suspense } from "react";
import { HuntDetails } from "@/components/context/hunts/hunt-detail";
import { HuntDetailsSkeleton } from "@/components/context/hunts/hunt-detail-skeleton";

export default function HuntDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container py-6 md:py-10">
      <Suspense fallback={<HuntDetailsSkeleton />}>
        <HuntDetails huntId={params.id} />
      </Suspense>
    </div>
  );
}
