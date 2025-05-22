"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sparkles, Award, Key, Crown, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserItem {
  id: string;
  quantity: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  item: {
    id: string;
    name: string;
    description: string;
    type: string;
  };
}

interface UserInventoryProps {
  userId: string;
}

export function UserInventory({ userId }: UserInventoryProps) {
  // Récupérer les articles de l'inventaire de l'utilisateur
  const {
    data: userItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-items", userId],
    queryFn: async () => {
      const response = await fetch("/api/user/items");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'inventaire");
      }
      return response.json() as Promise<UserItem[]>;
    },
  });

  // Icône en fonction du type d'article
  const getItemIcon = (type: string) => {
    switch (type) {
      case "BOOST":
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      case "COSMETIC":
        return <Award className="h-5 w-5 text-purple-500" />;
      case "HINT":
        return <Key className="h-5 w-5 text-blue-500" />;
      case "SPECIAL_ACCESS":
        return <Crown className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card/40 animate-pulse h-24 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">
          Une erreur est survenue lors du chargement de votre inventaire
        </p>
      </div>
    );
  }

  if (!userItems || userItems.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Vous n&apos;'avez aucun objet dans votre inventaire
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Vos objets</h2>

      {userItems.map((userItem) => (
        <Card key={userItem.id}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                {getItemIcon(userItem.item.type)}
                <CardTitle className="text-lg ml-2">
                  {userItem.item.name}
                </CardTitle>
              </div>
              <Badge variant="outline">Quantité: {userItem.quantity}</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            <p className="text-sm text-muted-foreground mb-2">
              {userItem.item.description}
            </p>

            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                Acheté le{" "}
                {format(new Date(userItem.createdAt), "d MMMM yyyy", {
                  locale: fr,
                })}
              </span>
            </div>

            {userItem.expiresAt && (
              <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  Expire le{" "}
                  {format(new Date(userItem.expiresAt), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
