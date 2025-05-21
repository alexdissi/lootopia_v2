"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { ShopItem } from "./shop-items";

interface ShopItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  type: string;
}

interface ShopItemsContainerProps {
  userId: string;
}

export function ShopItemsContainer({ userId }: ShopItemsContainerProps) {
  const [filter, setFilter] = useState<string | null>(null);

  // Récupérer la liste des articles
  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shop-items"],
    queryFn: async () => {
      const response = await fetch("/api/items/list");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des articles");
      }
      return response.json() as Promise<ShopItemType[]>;
    },
  });

  // Filtrer les articles par type si un filtre est sélectionné
  const filteredItems = items
    ? filter
      ? items.filter((item) => item.type === filter)
      : items
    : [];

  // Traduction des types d'articles pour l'affichage
  const typeTranslations: Record<string, string> = {
    BOOST: "Bonus",
    COSMETIC: "Cosmétique",
    HINT: "Indice",
    SPECIAL_ACCESS: "Accès Spécial",
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card/40 animate-pulse h-64 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">
          Une erreur est survenue lors du chargement des articles
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Aucun article disponible pour le moment
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {filter
            ? `Articles: ${typeTranslations[filter] || filter}`
            : "Tous les articles"}
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtrer
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter(null)}>
              Tous les articles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("BOOST")}>
              Bonus
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("COSMETIC")}>
              Cosmétique
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("HINT")}>
              Indices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("SPECIAL_ACCESS")}>
              Accès Spécial
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <ShopItem key={item.id} item={item} userId={userId} />
        ))}
      </div>
    </>
  );
}
