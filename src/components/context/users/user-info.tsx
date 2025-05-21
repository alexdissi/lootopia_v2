"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export interface UserFormValues {
  name: string;
  email: string;
  image?: string;
}

interface UserProfileFormProps {
  userId: string;
  initialData?: Partial<UserFormValues>;
}

export function UserProfileForm({ userId, initialData }: UserProfileFormProps) {
  const router = useRouter();

  const form = useForm<UserFormValues>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      image: initialData?.image || "",
    },
  });

  const image = useWatch({
    control: form.control,
    name: "image",
  });

  return (
    <Form {...form}>
      <form
        className="space-y-6 max-w-md"
        noValidate
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
                <Input
                  type="email"
                  placeholder="Email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Sauvegarder
        </Button>
      </form>
    </Form>
  );
}
