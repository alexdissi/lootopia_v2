"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


interface ReviewFormProps {
  huntId: string;
}

interface ReviewFormValues {
  comment: string;
  score: number;
}

export function ReviewForm({ huntId }: ReviewFormProps) {
  const router = useRouter();

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
      toast.success("Avis envoyé avec succès !");
      form.reset();
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue.");
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-w-md"
      >
        <h2 className="text-lg font-semibold">Laissez un avis</h2>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre commentaire</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Écrivez votre avis ici..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
  control={form.control}
  name="score"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Note</FormLabel>
      <FormControl>
        <select
          className="ml-2 border border-gray-300 rounded p-1"
          value={field.value}
          onChange={(e) => field.onChange(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Soumettre"
          )}
        </Button>
      </form>
    </Form>
  );
}
