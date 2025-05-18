"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { SignInWithProviderButton } from "@/components/ui/buttons";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            toast.success("Connexion réussie");
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            if (ctx.error.status === 403) {
              alert("Please verify your email address");
            }
            form.setError("email", {
              type: "manual",
              message: ctx.error.message,
            });
          },
        },
      );
    } catch (error) {
      console.error("Erreur de connexion :", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-muted-foreground">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="vous@exemple.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between w-full gap-9">
                  <FormLabel>Mot de passe</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-gray-400"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </Form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1a1f2e] px-2 text-gray-400">
            OU CONTINUER AVEC
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SignInWithProviderButton provider="google" />
        <SignInWithProviderButton provider="github" />
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Vous n'avez pas de compte ?{" "}
          <Link href="/auth/register" className="underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
