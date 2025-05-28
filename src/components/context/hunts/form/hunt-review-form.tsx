"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Star, Send, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  huntId: string;
  userRole: string;
}

interface ReviewFormValues {
  comment: string;
  score: number;
}

const scoreLabels = {
  1: "Très décevant",
  2: "Décevant",
  3: "Correct",
  4: "Très bien",
  5: "Excellent",
};

export function ReviewForm({ huntId, userRole }: ReviewFormProps) {
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const form = useForm<ReviewFormValues>({
    defaultValues: {
      comment: "",
      score: 5,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const response = await fetch(`/api/hunt/${huntId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, huntId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi de l'avis.");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Avis envoyé avec succès !", {
        description: "Merci pour votre retour !",
      });
      form.reset();
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de l'envoi", {
        description: error.message || "Une erreur est survenue.",
      });
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    if (!data.comment.trim()) {
      toast.error("Veuillez écrire un commentaire");
      return;
    }
    mutation.mutate(data);
  };

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoveredStar ?? value);
          return (
            <button
              key={star}
              type="button"
              className={`transition-all duration-200 hover:scale-110 ${
                isActive ? "text-yellow-400" : "text-muted-foreground/30"
              }`}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              onClick={() => onChange(star)}
            >
              <Star className={`h-8 w-8 ${isActive ? "fill-current" : ""}`} />
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {hoveredStar
            ? scoreLabels[hoveredStar as keyof typeof scoreLabels]
            : scoreLabels[value as keyof typeof scoreLabels]}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {hoveredStar ?? value}/5 étoiles
        </span>
      </div>
    </div>
  );

  if (userRole !== "user") {
    return (
      <Card className="w-full max-w-2xl mx-auto text-center p-8">
        <p className="text-lg text-muted-foreground">
          Vous devez être un utilisateur pour publier un avis.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Partagez votre expérience
        </CardTitle>
        <p className="text-muted-foreground">
          Votre avis nous aide à améliorer nos chasses au trésor
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-base font-semibold">
                    Comment évaluez-vous cette expérience ?
                  </FormLabel>
                  <FormControl>
                    <div className="flex justify-center py-4">
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">
                    Racontez-nous votre expérience
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Qu'avez-vous pensé de cette chasse au trésor ? Partagez vos moments préférés, ce qui vous a plu ou ce qui pourrait être amélioré..."
                      className="min-h-[120px] resize-none border-2 focus:border-primary/50 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm">
                    Minimum 10 caractères • {field.value.length}/500
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending || !form.watch("comment").trim()}
                size="lg"
                className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Publier mon avis
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {mutation.isSuccess && (
          <div className="text-center py-6 space-y-3 animate-in fade-in-50 duration-500">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-700">
              Merci pour votre avis !
            </h3>
            <p className="text-sm text-muted-foreground">
              Votre retour nous aide à créer de meilleures expériences
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
