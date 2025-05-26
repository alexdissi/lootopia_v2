"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
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

export function PasswordStep({
  setStep,
  setQrData,
}: {
  setStep: (step: "qrcode") => void;
  setQrData: (data: {
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }) => void;
}) {
  const form = useForm<{ password: string }>({
    defaultValues: { password: "" },
  });

  const enable2FA = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const response = await authClient.twoFactor.enable({
        password,
        issuer: "Lootopia",
      });
      return response.data;
    },
    onSuccess: (data) => {
      const qrCode = data
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.totpURI)}`
        : "";
      const secret = data
        ? new URL(data.totpURI).searchParams.get("secret") || ""
        : "";
      if (data) {
        setQrData({ qrCode, secret, backupCodes: data.backupCodes });
      }
      setStep("qrcode");
      toast.success("QR Code généré !");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Erreur lors de l'activation du 2FA"),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => enable2FA.mutate(d))}
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
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button type="submit" disabled={enable2FA.isPending}>
            {enable2FA.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Continuer
          </Button>
        </div>
      </form>
    </Form>
  );
}
