"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Sparkles, Key, Award } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ShopItemProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    type: string;
  };
  userId: string;
}

export function ShopItem({ item }: ShopItemProps) {
  const purchaseQuantity = 1;
  const queryClient = useQueryClient();

  const { mutate: purchaseItem, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/items/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: purchaseQuantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'achat");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer un rechargement des données
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-currency"] });

      // Afficher un toast de confirmation
      toast.success(`Vous avez acheté ${purchaseQuantity} ${item.name}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'achat");
    },
  });

  // Icône en fonction du type d'article
  const getItemIcon = () => {
    switch (item.type) {
      case "BOOST":
        return <Sparkles className="h-6 w-6 text-yellow-500" />;
      case "COSMETIC":
        return <Award className="h-6 w-6 text-purple-500" />;
      case "HINT":
        return <Key className="h-6 w-6 text-blue-500" />;
      case "SPECIAL_ACCESS":
        return <Crown className="h-6 w-6 text-green-500" />;
      default:
        return null;
    }
  };

  // Badge en fonction du type d'<articl></articl>e
  const getItemBadge = () => {
    switch (item.type) {
      case "BOOST":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Bonus
          </Badge>
        );
      case "COSMETIC":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-300">
            Cosmétique
          </Badge>
        );
      case "HINT":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Indice
          </Badge>
        );
      case "SPECIAL_ACCESS":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Accès
          </Badge>
        );
      default:
        return <Badge>Objet</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-40 bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {getItemIcon()}
          </div>
        )}
        <div className="absolute top-2 right-2">{getItemBadge()}</div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="flex items-center">
          <Crown className="h-4 w-4 text-amber-500 mr-1" />
          <span className="font-medium">{item.price}</span>
        </div>
      </CardContent>

      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={isPending}>
              {isPending ? "Achat en cours..." : "Acheter"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer l&apos;'achat</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment acheter {item.name} pour {item.price}{" "}
                couronnes ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => purchaseItem()}
                disabled={isPending}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
