import { Copy, Facebook, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HuntType } from "@/types/hunt";

interface HuntShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hunt: HuntType;
}

export function HuntShareDialog({
  isOpen,
  onClose,
  hunt,
}: HuntShareDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success("Lien copié dans le presse-papier");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    openShareWindow(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl,
      )}&text=${encodeURIComponent(`Découvrez "${hunt.title}" sur Lootopia`)}`,
    );
  };

  const shareOnFacebook = () => {
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    );
  };

  const shareOnLinkedin = () => {
    openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager la chasse au trésor</DialogTitle>
          <DialogDescription>
            Partagez cette chasse au trésor avec vos amis ou sur les réseaux
            sociaux.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex space-x-2">
            <Input readOnly value={shareUrl} className="flex-1" />
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              {isCopied ? "Copié" : "Copier"}
            </Button>
          </div>

          <div className="flex justify-center space-x-4 pt-2">
            <Button variant="outline" size="icon" onClick={shareOnTwitter}>
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={shareOnFacebook}>
              <Facebook className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={shareOnLinkedin}>
              <Linkedin className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
