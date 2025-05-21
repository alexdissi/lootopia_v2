import { CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hunt } from "@/interfaces/hunt";

interface LocationType {
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface Participant {
  userId: string;
  huntId: string;
  status?: string;
}

interface HuntInfoCardProps {
  hunt: Hunt & {
    participants?: Participant[];
    tags?: string[];
  };
}

export function HuntInfoCard({ hunt }: HuntInfoCardProps) {
  const getLocationAddress = () => {
    if (!hunt.location) return "Non spécifiée";

    if (typeof hunt.location === "string") {
      try {
        const locationObj = JSON.parse(hunt.location);
        return locationObj.address || "Non spécifiée";
      } catch {
        return hunt.location;
      }
    } else if (typeof hunt.location === "object") {
      return hunt.location.address || "Non spécifiée";
    }

    return "Non spécifiée";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{hunt.title}</CardTitle>
        <CardDescription className="mt-1 text-muted-foreground">
          {hunt.description || ""} {/* Ajout d'une valeur par défaut */}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {hunt.startDate ? (
                  <>
                    {format(new Date(hunt.startDate), "PPP", { locale: fr })}
                    {hunt.endDate && (
                      <>
                        {" "}
                        -{" "}
                        {format(new Date(hunt.endDate), "PPP", { locale: fr })}
                      </>
                    )}
                  </>
                ) : (
                  "Non spécifiée"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Durée estimée</p>
              <p className="text-sm text-muted-foreground">
                {hunt.estimatedDuration
                  ? `${hunt.estimatedDuration} minutes`
                  : "Non spécifiée"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Localisation</p>
              <p className="text-sm text-muted-foreground">
                {getLocationAddress()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Participants</p>
              <p className="text-sm text-muted-foreground">
                {hunt.participants?.length || 0} participants
              </p>
            </div>
          </div>
        </div>

        {hunt.tags && hunt.tags.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Catégories</p>
            <div className="flex flex-wrap gap-1.5">
              {hunt.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
