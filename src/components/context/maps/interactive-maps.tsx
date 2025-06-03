"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Target, Trophy, Eye, EyeOff } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveMapComponent } from "./interactive-maps-components";

interface StepDiscovery {
  id: string;
  userId: string;
  stepId: string;
  discoveredAt: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface HuntStep {
  id: string;
  title: string;
  description: string;
  hint?: string;
  imageUrl?: string;
  stepOrder: number;
  latitude?: number;
  location: string;
  longitude?: number;
  radius: number;
  discoveries: StepDiscovery[];
}

interface InteractiveHuntMapProps {
  huntId: string;
  userId: string;
  initialLocation: string;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function InteractiveHuntMap({
  huntId,
  userId,
  initialLocation,
}: InteractiveHuntMapProps) {
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [showHints, setShowHints] = useState(false);
  const [foundSteps, setFoundSteps] = useState<Set<string>>(new Set());

  const { data: steps, isLoading } = useQuery<HuntStep[]>({
    queryKey: ["hunt-steps", huntId],
    queryFn: async () => {
      const response = await fetch(
        `/api/hunt/${huntId}/steps?userId=${userId}`,
      );
      if (!response.ok) throw new Error("Erreur lors du chargement");
      return response.json();
    },
    enabled: Boolean(huntId),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const saveDiscovery = useMutation({
    mutationFn: async ({
      stepId,
      latitude,
      longitude,
      distance,
    }: {
      stepId: string;
      latitude: number;
      longitude: number;
      distance: number;
    }) => {
      const response = await fetch(`/api/hunt/${huntId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, latitude, longitude, distance }),
      });
      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");
      return response.json();
    },
  });

  useEffect(() => {
    if (steps && foundSteps.size === 0) {
      const found = new Set<string>();
      steps.forEach((step) => {
        if (step.discoveries.length > 0) {
          found.add(step.id);
        }
      });
      setFoundSteps(found);
    }
  }, [steps]);

  const handleMapClick = useCallback(
    (coordinates: [number, number]) => {
      setSelectedCoordinates(coordinates);
      if (!initialLocation) return;

      const [lng, lat] = coordinates;

      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(initialLocation)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.features?.[0]?.center) {
            const [treasureLng, treasureLat] = data.features[0].center;

            const distance = calculateDistance(
              lat,
              lng,
              treasureLat,
              treasureLng,
            );

            if (distance <= 500) {
              toast.success("🎉 Félicitations ! Tu as trouvé le trésor !", {
                description: `Distance: ${Math.round(distance)}m`,
                duration: 5000,
              });
            } else {
              let hint = "";
              if (distance > 5000) hint = "Tu es très loin du trésor ! 🗺️";
              else if (distance > 2000)
                hint = "Tu te rapproches du trésor ! 🚶‍♂️";
              else if (distance > 1000) hint = "Tu es proche du trésor ! 🔍";
              else hint = "Très proche du trésor ! 🔥";

              toast.error(hint, {
                description: `Distance: ${Math.round(distance)}m`,
                duration: 3000,
              });
            }
          } else {
            toast.error("Impossible de localiser le trésor");
          }
        })
        .catch((error) => {
          console.error("❌ Erreur geocoding:", error);
          toast.error("Erreur de géolocalisation");
        });
    },
    [initialLocation],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!steps) return null;

  const totalSteps = steps.length;
  const progress: number = 0; // Pas de progression, juste trouver le trésor

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Chasse au Trésor ({foundSteps.size}/{totalSteps})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHints(!showHints)}
            >
              {showHints ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <div className="flex items-center gap-2 text-green-600 font-medium mt-2">
              <Trophy className="h-5 w-5" />
              Chasse terminée ! 🎉
            </div>
          )}
        </CardContent>
      </Card>
      <InteractiveMapComponent
        onMapClick={handleMapClick}
        selectedCoordinates={selectedCoordinates}
        completedSteps={[]}
        currentStep={0}
        isLoading={false}
      />
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            🎯 Clique sur la carte pour chercher les indices !
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
