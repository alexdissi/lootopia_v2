import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface HuntDeleteDialogProps {
  huntId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function HuntDeleteDialog({
  huntId,
  isOpen,
  onClose,
}: HuntDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const deleteHunt = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/hunt/${huntId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete hunt");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Chasse au trésor supprimée avec succès");
      onClose();
      router.push("/dashboard/hunts");
    },
    onError: () => {
      toast.error("Impossible de supprimer la chasse au trésor");
    },
  });

  const handleDelete = () => {
    if (confirmText !== "supprimer") return;
    deleteHunt.mutate();
  };

  const isButtonDisabled = confirmText !== "supprimer" || deleteHunt.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir supprimer cette chasse ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les données associées à cette
            chasse au trésor seront définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <p className="text-sm mb-2">
            Pour confirmer, tapez <span className="font-bold">supprimer</span>{" "}
            ci-dessous :
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="supprimer"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isButtonDisabled}
          >
            {deleteHunt.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Supprimer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
