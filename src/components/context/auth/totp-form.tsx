"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const totpSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir exactement 6 chiffres")
    .regex(/^\d+$/, "Le code ne doit contenir que des chiffres"),
});

type TotpFormValues = z.infer<typeof totpSchema>;

export default function TotpForm() {
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<TotpFormValues>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: TotpFormValues) {
    setIsLoading(true);

    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: data.code,
      });

      if (res.data?.token) {
        setSuccess(true);
        toast.success("Authentification réussie !");
        router.push("/dashboard");
      } else {
        throw new Error("Code invalide");
      }
    } catch {
      setIsLoading(false);
      toast.error("Code invalide");
      form.setError("code", {
        type: "manual",
        message: "Code TOTP invalide",
      });
      form.setValue("code", "");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">
            Authentification à deux facteurs
          </CardTitle>
          <CardDescription className="mt-2">
            Saisissez le code à 6 chiffres de votre application
            d'authentification
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {!success ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-center block">
                      Code TOTP
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            if (value.length === 6) {
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                          disabled={isLoading}
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

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || form.watch("code").length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier le code"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-green-600">
                Vérification réussie !
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection en cours...
              </p>
            </div>
          </div>
        )}

        {!success && (
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Utilisez votre application d'authentification
            </p>
            <p className="text-xs text-gray-500">
              Google Authenticator, Authy, Microsoft Authenticator, etc.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
