"use client";

import { Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function SuccessStep({
  resetFlow,
  qrData,
}: {
  resetFlow: () => void;
  qrData: { backupCodes: string[] };
}) {
  const copyBackupCodes = async () => {
    try {
      const codesText = qrData.backupCodes.join("\n");
      await navigator.clipboard.writeText(codesText);
      toast.success("Codes copiés !");
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const downloadBackupCodes = () => {
    const content = [
      "Codes de récupération 2FA - Lootopia",
      "==================================",
      "",
      "IMPORTANT : Conservez ces codes en lieu sûr !",
      "",
      ...qrData.backupCodes.map((c, i) => `${i + 1}. ${c}`),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lootopia-2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Fichier téléchargé !");
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-green-800 font-medium">
          2FA activé avec succès ! Sauvegardez vos codes de récupération.
        </p>
      </div>

      {qrData.backupCodes && (
        <div className="space-y-2">
          <Label>Codes de récupération :</Label>
          <div className="p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {qrData.backupCodes.map((code, i) => (
                <div
                  key={i}
                  className="text-center py-1 px-2 bg-background rounded border"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={copyBackupCodes}>
              <Copy className="h-4 w-4 mr-2" /> Copier tous les codes
            </Button>
            <Button variant="outline" onClick={downloadBackupCodes}>
              <Download className="h-4 w-4 mr-2" /> Télécharger les codes
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button className="w-full" onClick={resetFlow}>
          Terminer
        </Button>
      </div>
    </div>
  );
}
