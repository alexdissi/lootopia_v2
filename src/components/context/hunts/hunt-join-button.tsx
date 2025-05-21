"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface HuntJoinButtonProps {
  huntId: string;
  fee: number | null;
  className?: string;
}

export function HuntJoinButton({
  huntId,
  fee = 0,
  className,
}: HuntJoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleJoinHunt() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/hunt/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ huntId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite");
      }

      toast.success(
        data.message || "Vous avez rejoint la chasse au trésor avec succès !",
      );

      router.refresh();
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Une erreur s'est produite lors de la tentative de rejoindre la chasse au trésor.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleJoinHunt} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Traitement en cours...
        </>
      ) : (
        <>Rejoindre {fee && fee > 0 ? `(${fee} pièces)` : "(Gratuit)"}</>
      )}
    </Button>
  );
}
