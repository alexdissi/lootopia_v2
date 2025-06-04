"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Camera, User, UserCheck, Mail, Shield, Badge, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ChangePasswordModal } from "@/components/password/ChangePasswordModal";
import { Separator } from "@radix-ui/react-separator";
import { useForm, useWatch } from "react-hook-form";
import { TwoFactorSetup } from "./2fa/two-factor-setup";

export interface UserFormValues {
  name: string;
  email: string;
  nickname?: string;
  image?: string;
}

interface UserProfileFormProps {
  userId: string;
}

export function UserProfileForm({ userId }: UserProfileFormProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Gestion de l'ouverture de la modale de changement de mot de passe

  const form = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      nickname: "",
      image: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      const userData = {
        name: session.user.name || "",
        email: session.user.email || "",
        nickname: (session.user as any).nickname || "",
        image: session.user.image || "",
      };
      form.reset(userData);
      setImagePreview(userData.image || "");
    }
  }, [session, form]);

  const image = useWatch({
    control: form.control,
    name: "image",
  });

  useEffect(() => {
    setImagePreview(image || "");
  }, [image]);

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

  if (isPending) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const is2FAEnabled = session?.user?.twoFactorEnabled;

  const handlePasswordChangeModal = () => {
    setIsPasswordModalOpen(true);
  };

  const closePasswordChangeModal = () => {
    setIsPasswordModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo de profil
            </CardTitle>
            <CardDescription>Votre image de profil publique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={imagePreview || "/placeholder.svg"}
                  alt="Photo de profil"
                />
                <AvatarFallback className="text-2xl">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/avatar.jpg"
                          {...field}
                          className="text-center"
                        />
                      </FormControl>
                      <FormDescription className="text-center">
                        URL de votre image de profil
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>Vos informations de base</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Nom complet
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom complet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Nom d'utilisateur
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre nom d'utilisateur"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Adresse email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cette adresse sera utilisée pour les notifications
                        importantes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="min-w-[140px]"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      "Sauvegarder"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez vos paramètres de sécurité et d'authentification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  Authentification à deux facteurs
                </h3>
                <Badge
                  variant={is2FAEnabled ? "default" : "secondary"}
                  className="text-xs"
                >
                  {is2FAEnabled ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled
                  ? "Votre compte est protégé par l'authentification à deux facteurs"
                  : "Ajoutez une couche de sécurité supplémentaire à votre compte"}
              </p>
            </div>
            <TwoFactorSetup />
          </div>

          <Separator />


          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium">Mot de passe</h3>
              <p className="text-sm text-muted-foreground">
                Modifiez votre mot de passe de connexion
              </p>
            </div>
            <Button variant="outline" onClick={handlePasswordChangeModal}>
              Changer le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal for password change */}
      {isPasswordModalOpen && (
        <ChangePasswordModal userId={userId} onClose={closePasswordChangeModal} />
      )}
    </div>
  );
}
