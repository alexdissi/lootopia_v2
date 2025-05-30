"use client";

import { MapView } from "@/components/ui/maps";

interface InteractiveMapComponentProps {
  location: string;
  onMapClick: (coordinates: [number, number]) => void;
  selectedCoordinates: [number, number] | null;
  completedSteps: string[];
  currentStep: number;
  isLoading: boolean;
}

export function InteractiveMapComponent({
  location,
  onMapClick,
  selectedCoordinates,
  isLoading,
}: InteractiveMapComponentProps) {
  return (
    <div className="relative">
      <MapView
        location={location}
        height="500px"
        interactive
        className="cursor-crosshair border-2 border-primary/20 rounded-lg"
        onMapClick={onMapClick}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Vérification en cours...</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-700">
          🎯 Clique sur la carte pour chercher l'indice !
        </p>
      </div>

      {selectedCoordinates && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md">
          <p className="text-xs text-gray-600">
            📍 {selectedCoordinates[1].toFixed(6)},{" "}
            {selectedCoordinates[0].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
