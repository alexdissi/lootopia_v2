"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ChangePasswordModalProps = {
  userId: string;
  onClose: () => void;
};

export function ChangePasswordModal({
  userId,
  onClose,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState(""); // Ancien mot de passe
  const [newPassword, setNewPassword] = useState(""); // Nouveau mot de passe
  const [errorMessage, setErrorMessage] = useState(""); // Message d'erreur

  const handlePasswordChange = async () => {
    if (oldPassword === newPassword) {
      setErrorMessage(
        "Le nouveau mot de passe doit être différent de l'ancien.",
      );
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}/change_password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Mot de passe changé avec succès !");
        onClose();
      } else {
        const data = await response.json();
        setErrorMessage(
          data.error || "Erreur lors du changement de mot de passe",
        );
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe :", error);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Changer le mot de passe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="Ancien mot de passe"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

        <div className="flex justify-end space-x-2">
          <Button onClick={handlePasswordChange} className="min-w-[140px]">
            Modifier
          </Button>
          <Button onClick={onClose} className="min-w-[140px]">
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
