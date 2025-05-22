"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  if (isLoading) return <p>Chargement des avis...</p>;
  if (error || !reviews) return <p>Impossible de charger les avis.</p>;

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 border rounded-lg bg-muted/5 flex items-start space-x-4"
        >
          <Avatar>
            <AvatarImage src={review.user.image || ""} />
            <AvatarFallback>
              {review.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{review.user.name}</p>
            <div className="flex items-center space-x-1 text-yellow-500 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < review.score ? "★" : "☆"}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
