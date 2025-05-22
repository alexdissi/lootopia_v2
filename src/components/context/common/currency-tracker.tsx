"use client";

import { useQuery } from "@tanstack/react-query";
import { Crown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-900/30 to-amber-700/30 dark:from-amber-900/40 dark:to-amber-700/40 px-4 py-2 rounded-full border border-amber-500/20 dark:border-amber-500/30 shadow-inner hover:border-amber-500/40 transition-all cursor-pointer">
              <div className="relative">
                <Crown className="h-5 w-5 text-amber-400 dark:text-amber-300 transform hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 dark:bg-amber-300 rounded-full animate-pulse" />
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <span className="text-sm font-medium text-amber-100 dark:text-amber-50">
                  {data?.amount?.toLocaleString() ?? "0"}{" "}
                  <span className="hidden sm:inline">Couronnes</span>
                </span>
              )}
            </div>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Votre monnaie virtuelle pour participer aux chasses</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            Vos Couronnes
          </DialogTitle>
          <DialogDescription>
            Les couronnes sont la monnaie virtuelle de Lootopia. Elles vous
            permettent de participer à des chasses au trésor exclusives.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div className="font-medium">Solde actuel</div>
            <div className="text-xl font-bold text-amber-500">
              {data?.amount?.toLocaleString() ?? "0"}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Dernières transactions
            </h4>
            <div className="text-sm text-muted-foreground">
              {/* Idéalement, cette section afficherait l'historique réel des transactions */}
              <p className="py-1 border-b">
                + 50 couronnes • Participation à la chasse "Trésors de Paris"
              </p>
              <p className="py-1 border-b">
                - 100 couronnes • Inscription à la chasse "Énigmes de Lyon"
              </p>
              <p className="py-1">
                + 200 couronnes • Victoire à la chasse "Mystères de Marseille"
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline">Historique complet</Button>
          <Button variant="default" className="bg-amber-500 hover:bg-amber-600">
            Obtenir plus de couronnes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
