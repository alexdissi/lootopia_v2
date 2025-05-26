"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { DisableStep } from "./disable-step";
import { PasswordStep } from "./password-step";
import { QRCodeStep } from "./qr-code-step";
import { VerifyStep } from "./verify-code";
import { SuccessStep } from "./success-step";

type Step = "password" | "qrcode" | "verify" | "success" | "disable";

export function TwoFactorSetup() {
  const session = authClient.useSession();
  const is2FAEnabled = session?.data?.user?.twoFactorEnabled;
  console.log("TwoFactorSetup is2FAEnabled", is2FAEnabled);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step | null>(null);
  const [qrData, setQrData] = useState<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  } | null>(null);

  const handleOpen = () => {
    setStep(is2FAEnabled ? "disable" : "password");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setStep(null);
    setQrData(null);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="mt-6" onClick={handleOpen}>
          {is2FAEnabled ? "Gérer le 2FA" : "Activer le 2FA"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>
          {is2FAEnabled
            ? "Gérer la vérification en deux étapes"
            : "Activer la vérification en deux étapes"}
        </AlertDialogTitle>
        {step === "password" && (
          <PasswordStep setStep={setStep} setQrData={setQrData} />
        )}
        {step === "qrcode" && qrData && (
          <QRCodeStep
            setStep={setStep}
            qrData={qrData}
            resetFlow={closeModal}
          />
        )}
        {step === "verify" && (
          <VerifyStep setStep={setStep} onSuccess={closeModal} />
        )}
        {step === "success" && qrData && (
          <SuccessStep resetFlow={closeModal} qrData={qrData} />
        )}
        {step === "disable" && <DisableStep onSuccess={closeModal} />}
      </AlertDialogContent>
    </AlertDialog>
  );
}
