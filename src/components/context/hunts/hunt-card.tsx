"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Hunt } from "@/interfaces/hunt";

interface HuntCardProps {
  hunt: Hunt;
  showEditButton: boolean;
}

export function HuntCard({ hunt, showEditButton }: HuntCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-1">{hunt.title}</CardTitle>
          {getStatusBadge(hunt.status)}
        </div>
        {hunt.startDate && (
          <p className="text-sm text-muted-foreground">
            {format(new Date(hunt.startDate), "PPP", {
              locale: fr,
            })}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-4">
          {hunt.description || "Aucune description"}
        </p>

        <div className="flex items-center justify-between text-sm">
          {hunt.location ? (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="line-clamp-1">{String(hunt.location)}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1" />
            <span>{hunt._count.participants}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Link
          href={`/dashboard/hunts/${hunt.id}`}
          className={showEditButton ? "flex-1" : "w-full"}
        >
          <Button variant="outline" size="sm" className="w-full">
            Voir les détails
          </Button>
        </Link>
        {showEditButton && (
          <Link href={`/dashboard/hunts/${hunt.id}/edit`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              Modifier
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">En attente</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-green-500">En cours</Badge>;
    case "COMPLETED":
      return <Badge variant="secondary">Terminée</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Annulée</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
