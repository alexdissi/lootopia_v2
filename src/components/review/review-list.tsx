"use client";

import { useQuery } from "@tanstack/react-query";
import { Star, MessageCircle, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Review = {
  id: string;
  userId: string;
  huntId: string;
  score: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
};

export function ReviewList({ huntId }: { huntId: string }) {
  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reviews", huntId],
    queryFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}/reviews`);
      if (!res.ok) throw new Error("Erreur lors du chargement des avis");
      return res.json() as Promise<Review[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Avis des participants</h3>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !reviews) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Aucun avis pour le moment</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Aucun avis pour le moment
        </h3>
        <p className="text-muted-foreground">
          Soyez le premier à partager votre expérience !
        </p>
      </div>
    );
  }

  const averageScore =
    reviews.reduce((acc, review) => acc + review.score, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Avis des participants ({reviews.length})
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{averageScore.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <Card
            key={review.id}
            className="overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-primary/20"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "fadeInUp 0.5s ease-out forwards",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                    <AvatarImage src={review.user.image || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {review.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground truncate">
                        {review.user.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Étoiles */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 transition-colors ${
                                i < review.score
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {review.score}/5
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Commentaire */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-muted/50">
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
