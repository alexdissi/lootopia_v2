"use client";

import { CheckCircle, XCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PaymentModalWrapper({
  paymentStatus,
}: {
  paymentStatus: "success" | "cancel" | null;
}) {
  return <PaymentModal initialStatus={paymentStatus} />;
}

function PaymentModal({
  initialStatus,
}: {
  initialStatus: "success" | "cancel" | null;
}) {
  const [open, setOpen] = useState(Boolean(initialStatus));
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    window.history.replaceState({}, "", url.toString());
  };

  const handleGoHome = () => {
    router.push("/");
  };

  useEffect(() => {
    const handlePopState = () => setOpen(false);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {initialStatus === "success"
              ? "Paiement confirmé"
              : "Paiement annulé"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {initialStatus === "success"
              ? "Votre transaction a été traitée avec succès"
              : "Votre transaction n'a pas pu aboutir"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {initialStatus === "success" ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-center text-sm text-gray-600">
                Nous vous remercions pour votre achat. Les artefacts ont été
                ajoutés à votre compte.
              </p>
              <Button className="w-full" onClick={handleGoHome}>
                Continuer l&apos;'aventure
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-center text-sm text-gray-600">
                Votre paiement n&apos;'a pas pu être traité. Aucun montant
                n&apos;'a été débité.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Réessayer
              </Button>
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
