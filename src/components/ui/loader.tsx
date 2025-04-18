"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoaderPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Loader2 className={cn("h-10 w-10 animate-spin text-primary")} />
    </div>
  );
}
