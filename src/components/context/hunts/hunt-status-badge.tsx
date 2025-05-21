import { Badge } from "@/components/ui/badge";

export function HuntStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 border-amber-200"
        >
          En attente
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="text-xs px-2 py-0.5 bg-green-500 border-green-600 text-white">
          En cours
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 bg-muted/20 text-foreground border-muted/30"
        >
          Terminée
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="text-xs px-2 py-0.5">
          Annulée
        </Badge>
      );
    default:
      return <Badge className="text-xs px-2 py-0.5">{status}</Badge>;
  }
}
