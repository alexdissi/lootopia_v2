"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapView } from "@/components/ui/maps";
import { MapPin } from "lucide-react";
import { Hunt } from "@/interfaces/hunt";

export default function HuntMapView({ hunt }: { hunt: Hunt }) {
  if (!hunt.location) {
    return (
      <Card className="overflow-hidden border-none shadow-md">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">Aucune localisation</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Cette chasse au trésor n'a pas de localisation définie.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  let locationString = "";

  try {
    if (typeof hunt.location === "string") {
      locationString = hunt.location;
    } else if (hunt.location && typeof hunt.location === "object") {
      if (hunt.location.address) {
        locationString = hunt.location.address;
      } else if (
        hunt.location.latitude !== undefined &&
        hunt.location.longitude !== undefined
      ) {
        locationString = `${hunt.location.latitude},${hunt.location.longitude}`;
      } else {
        locationString = JSON.stringify(hunt.location);
      }
    } else {
      locationString = String(hunt.location);
    }

    return (
      <div className="rounded-xl overflow-hidden shadow-lg">
        <MapView
          location={locationString}
          height="70vh"
          className="w-full"
          zoom={14}
        />
      </div>
    );
  } catch (error) {
    return (
      <Card className="overflow-hidden border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-destructive font-medium">
              Erreur lors du chargement de la carte
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
}
