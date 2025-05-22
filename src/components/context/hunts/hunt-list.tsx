"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HuntCard } from "./hunt-card";
import { HuntsListSkeleton } from "./hunt-skeleton";

interface HuntsListProps {
  hunts: any[];
  isLoading: boolean;
  emptyMessage: string;
  emptyAction?: string;
  emptyActionLabel?: string;
  showEditButton: boolean;
}

export function HuntsList({
  hunts,
  isLoading,
  emptyMessage,
  emptyAction,
  emptyActionLabel,
  showEditButton,
}: HuntsListProps) {
  if (isLoading) {
    return <HuntsListSkeleton />;
  }

  if (!hunts || hunts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {emptyAction && (
          <Link href={emptyAction}>
            <Button variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              {emptyActionLabel}
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hunts.map((hunt) => (
        <HuntCard key={hunt.id} hunt={hunt} showEditButton={showEditButton} />
      ))}
    </div>
  );
}
