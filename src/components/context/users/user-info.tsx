"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
=======
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { UserRole } from "../../../../generated/prisma";
import { authClient } from "@/lib/auth-client";
>>>>>>> 3993606 (.)
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export interface UserFormValues {
  name: string;
  email: string;
<<<<<<< HEAD
  nickname?: string;
=======
>>>>>>> 3993606 (.)
  image?: string;
}

interface UserProfileFormProps {
  userId: string;
  initialData?: Partial<UserFormValues>;
}

<<<<<<< HEAD
export function UserProfileForm({ userId }: UserProfileFormProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
=======
export function UserProfileForm({ userId, initialData }: UserProfileFormProps) {
  const router = useRouter();
  const { data: session, isLoading } = authClient.useSession();
>>>>>>> 3993606 (.)

  const form = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
<<<<<<< HEAD
      nickname: "",
=======
>>>>>>> 3993606 (.)
      image: "",
    },
  });

<<<<<<< HEAD
=======
  // Update form values when session data is available
>>>>>>> 3993606 (.)
  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || "",
        email: session.user.email || "",
<<<<<<< HEAD
        nickname: (session.user as any).nickname || "",
=======
>>>>>>> 3993606 (.)
        image: session.user.image || "",
      });
    }
  }, [session, form]);

  const image = useWatch({
    control: form.control,
    name: "image",
  });

  const mutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Une erreur s'est produite lors de la mise à jour",
      );
    },
  });

  const onSubmit = (data: UserFormValues) => {
    mutation.mutate(data);
  };

<<<<<<< HEAD
  if (isPending) {
=======
  if (isLoading) {
>>>>>>> 3993606 (.)
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="space-y-6 max-w-md"
        onSubmit={form.handleSubmit(onSubmit)}
<<<<<<< HEAD
        noValidate
=======
>>>>>>> 3993606 (.)
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Nom complet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
<<<<<<< HEAD
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom d'utilisateur</FormLabel>
              <FormControl>
                <Input placeholder="Nom d'utilisateur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
=======
>>>>>>> 3993606 (.)
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image de profil</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {image && (
                <img
                  src={image}
                  alt="Aperçu de l'image"
                  className="mt-2 w-32 h-32 object-cover rounded-md border"
                />
              )}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </form>
    </Form>
  );
}
