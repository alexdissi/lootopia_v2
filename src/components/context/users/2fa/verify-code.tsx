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

export function VerifyStep({
  setStep,
  onSuccess,
}: {
  setStep: (step: "success") => void;
  onSuccess: () => void;
}) {
  const form = useForm<{ code: string }>({ defaultValues: { code: "" } });

  const verifyMutation = useMutation({
    mutationFn: async ({ code }: { code: string }) =>
      authClient.twoFactor.verifyTotp({ code }),
    onSuccess: () => {
      toast.success("2FA activé !");
      setStep("success");
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Code invalide");
    },
  });

  const onSubmit = (data: { code: string }) => {
    if (!data.code || data.code.length !== 6) {
      toast.error("Veuillez entrer un code à 6 chiffres");
      return;
    }
    verifyMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code de vérification</FormLabel>
              <FormControl>
                <Input
                  placeholder="123456"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    field.onChange(value);
                  }}
                  className="text-center text-lg tracking-widest"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Vérifier
          </Button>
        </div>
      </form>
    </Form>
  );
}
