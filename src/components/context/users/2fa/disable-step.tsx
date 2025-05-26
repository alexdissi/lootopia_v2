"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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

export function DisableStep({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<{ password: string }>({
    defaultValues: { password: "" },
  });
  const session = authClient.useSession();
  console.log("DisableStep session", session);

  const disable2FA = useMutation({
    mutationFn: async ({ password }: { password: string }) => authClient.twoFactor.disable({ password }),
    onSuccess: () => {
      toast.success("2FA désactivé");
      authClient.updateUser();
      onSuccess();
    },
    onError: (err: Error) =>
      toast.error(err.message || "Erreur lors de la désactivation"),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => disable2FA.mutate(d))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={disable2FA.isPending}>
            {disable2FA.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Désactiver le 2FA
          </Button>
        </div>
      </form>
    </Form>
  );
}
