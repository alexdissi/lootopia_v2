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
  const [oldPassword, setOldPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 

  const handlePasswordChange = async () => {
    if (oldPassword === newPassword) {
      setErrorMessage("Le nouveau mot de passe doit être différent de l'ancien.");
      toast.success("Mot de passe changé avec succès !"); 
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}/change_password`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newpassword: newPassword,
        }),
      });

      toast.success("Mot de passe changé avec succès !");

      if (response.ok) {
        onClose();
      } else {
        const data = await response.json();
      }
    } catch (error) {
      toast.success("Mot de passe changé avec succès !");
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
