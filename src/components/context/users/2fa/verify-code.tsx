"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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
    mutationFn: async ({ code }: { code: string }) => {
      const res = await authClient.twoFactor.verifyTotp({
        code,
      });

      if (res.data?.token) {
        toast.success("2FA activé avec succès !");
        setStep("success");
        onSuccess();
        return res.data;
      } else {
        throw new Error("Code de vérification invalide");
      }
    },
    onError: () => {
      toast.error("Code de vérification invalide");
      form.setValue("code", "");
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Vérifiez votre configuration</h3>
        <p className="text-sm text-muted-foreground">
          Saisissez le code à 6 chiffres affiché dans votre application
          d'authentification
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-center block">
                  Code de vérification
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        // Auto-submit quand les 6 chiffres sont saisis
                        if (value.length === 6) {
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      disabled={verifyMutation.isPending}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={
                verifyMutation.isPending || form.watch("code").length !== 6
              }
              className="min-w-[100px]"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
