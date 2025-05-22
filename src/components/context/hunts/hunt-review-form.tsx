"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  huntId: string;
  onSuccess: () => void;
}

export function ReviewForm({ huntId, onSuccess }: ReviewFormProps) {
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(0);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ huntId, comment, rating: score }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l’envoi de l’avis");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Merci pour votre avis !");
      setComment("");
      setScore(0);
      onSuccess(); 
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const canSubmit = comment.trim().length > 0 && score > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) mutation.mutate();
      }}
      className="border p-4 rounded-lg space-y-4 bg-muted"
    >
      <h3 className="text-lg font-semibold">Laisser un avis</h3>

      <Textarea
        placeholder="Votre commentaire..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        required
      />

      <div className="flex items-center gap-2">
        <label htmlFor="note">Note :</label>
        <input
          id="note"
          type="number"
          min={1}
          max={5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-16 border rounded px-2 py-1"
          required
        />
        <span>/ 5</span>
      </div>

      <Button type="submit" disabled={!canSubmit || mutation.isLoading}>
        {mutation.isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi...
          </>
        ) : (
          "Envoyer"
        )}
      </Button>
    </form>
  );
}
