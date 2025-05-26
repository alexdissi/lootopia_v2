"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function QRCodeStep({
  setStep,
  qrData,
  resetFlow,
}: {
  setStep: (step: "verify") => void;
  qrData: { qrCode: string; secret: string; backupCodes: string[] };
  resetFlow: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copySecret = async () => {
    await navigator.clipboard.writeText(qrData.secret);
    setCopied(true);
    toast.success("Secret copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-lg border">
          <img src={qrData.qrCode} alt="QR Code 2FA" className="w-48 h-48" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Ou saisissez ce secret :</Label>
        <div className="flex space-x-2">
          <Input value={qrData.secret} readOnly className="font-mono text-sm" />
          <Button size="icon" variant="outline" onClick={copySecret}>
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={resetFlow}>
          Annuler
        </Button>
        <Button onClick={() => setStep("verify")}>J'ai scanné le code</Button>
      </div>
    </div>
  );
}
