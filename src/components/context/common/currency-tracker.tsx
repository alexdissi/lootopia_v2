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
  const { data, isLoading } = useQuery<CurrencyData>({
    queryKey: ["currencyBalance"],
    queryFn: fetchCurrencyBalance,
    refetchInterval: 60000,
    retry: 2,
  });

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-900/30 to-amber-700/30 px-4 py-2 rounded-full border border-amber-500/20 shadow-inner">
      <div className="relative">
        <Coins className="h-5 w-5 text-amber-400" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-24" />
      ) : (
        <span className="text-sm font-medium text-amber-100">
          {data?.amount?.toLocaleString() ?? "0"}{" "}
          <span className="hidden sm:inline">Couronnes</span>
        </span>
      )}
    </div>
  );
}
