import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HuntType {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdBy?: {
    name?: string | null;
    email?: string | null;
  } | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  fee?: number | null;
  steps?: Array<any>;
  [key: string]: any;
}

interface HuntStatusSectionProps {
  hunt: HuntType;
  isCreator: boolean;
  onRefetch: () => void;
}

export function HuntStatusSection({
  hunt,
  isCreator,
  onRefetch,
}: HuntStatusSectionProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const updateHuntStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/hunt/${hunt.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update hunt status");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Statut de la chasse mis à jour");
      onRefetch();
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le statut");
    },
  });

  if (!isCreator) return null;

  const isPending = hunt.status === "PENDING";
  const isActive = hunt.status === "IN_PROGRESS";

  return (
    <>
      <Card className={isPending ? "border-amber-200" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {isPending ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {isPending
              ? "Chasse en attente de publication"
              : "Statut de la chasse"}
          </CardTitle>
          <CardDescription>
            {isPending
              ? "Cette chasse n'est pas encore visible pour les participants."
              : "Cette chasse est actuellement publiée et visible par les participants."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          {isPending ? (
            <Button onClick={() => setPublishDialogOpen(true)}>
              Publier la chasse
            </Button>
          ) : isActive ? (
            <Button
              variant="outline"
              onClick={() => updateHuntStatus.mutate("COMPLETED")}
              disabled={updateHuntStatus.isPending}
            >
              Clôturer la chasse
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => updateHuntStatus.mutate("IN_PROGRESS")}
              disabled={updateHuntStatus.isPending}
            >
              Réactiver la chasse
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publier la chasse au trésor</DialogTitle>
            <DialogDescription>
              Une fois publiée, votre chasse sera visible par les participants.
              Assurez-vous que toutes les étapes sont correctement configurées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={() => {
                updateHuntStatus.mutate("IN_PROGRESS");
                setPublishDialogOpen(false);
              }}
              disabled={updateHuntStatus.isPending}
            >
              Publier maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
