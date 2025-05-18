"use client";

import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyData {
  amount: number;
  updatedAt: string;
}

const fetchCurrencyBalance = async (): Promise<CurrencyData> => {
  const res = await fetch("/api/currency/balance");
  if (!res.ok) {
    throw new Error("Impossible de récupérer le solde");
  }
  return res.json();
};

export function CurrencyTracker() {
  const { data, isLoading, error } = useQuery<CurrencyData>({
    queryKey: ["currencyBalance"],
    queryFn: fetchCurrencyBalance,
    refetchInterval: 60000,
    retry: 2,
  });

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-ful">
      <Coins className="h-4 w-4 text-amber-400" />
      {isLoading ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <span className="text-sm font-medium text-amber-100">
          {data?.amount?.toLocaleString() ?? "0"} Couronnes
        </span>
      )}
    </div>
  );
}
