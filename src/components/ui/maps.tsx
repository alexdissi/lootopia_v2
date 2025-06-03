/* eslint-disable */

"use client";

import { Loader2, MapPin, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";

// Remove explicit type to avoid type mismatch issues
let mapboxgl: any;

interface MapViewProps {
  location: string;
  height?: string;
  zoom?: number;
  className?: string;
  interactive?: boolean;
  mapStyle?: string;
  onMapClick?: (coordinates: [number, number]) => void; // 👈 JUSTE AJOUTE ÇA
}

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function MapView({
  location,
  height = "200px",
  zoom = 13,
  className,
  interactive = true,
  mapStyle = "mapbox://styles/mapbox/streets-v12",
  onMapClick, // 👈 ET ÇA
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isClientReady, setIsClientReady] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("mapbox-gl").then((mapbox) => {
        mapboxgl = mapbox.default || mapbox;
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        setIsClientReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!isClientReady || !mapRef.current) return;

    const initializeMap = () => {
      if (mapInstanceRef.current) return;

      mapInstanceRef.current = new mapboxgl.Map({
        container: mapRef.current,
        style: mapStyle,
        center: [0, 0],
        zoom: zoom,
        pitch: 45, // Inclinaison pour un effet 3D
        bearing: 0,
        antialias: true, // Pour un meilleur rendu
        interactive: interactive,
      });

      // 👇 AJOUTE JUSTE ÇA POUR LE CLIC
      if (mapInstanceRef.current && onMapClick) {
        mapInstanceRef.current.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          console.log("🗺️ Clic sur la carte:", lng, lat);
          onMapClick([lng, lat]);
        });

        // Change le curseur pour indiquer qu'on peut cliquer
        mapInstanceRef.current.on("mouseenter", () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.getCanvas().style.cursor = "crosshair";
          }
        });

        mapInstanceRef.current.on("mouseleave", () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.getCanvas().style.cursor = "";
          }
        });
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: true,
            visualizePitch: true,
          }),
          "bottom-right",
        );
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.on("load", () => {
          if (!mapInstanceRef.current?.getLayer("3d-buildings")) {
            mapInstanceRef.current?.addLayer({
              id: "3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 15,
              paint: {
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  15.05,
                  ["get", "height"],
                ],
                "fill-extrusion-base": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  15.05,
                  ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.6,
              },
            });
          }
        });
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.on("load", () => {
          mapInstanceRef.current?.setLight({
            anchor: "viewport",
            color: "white",
            intensity: 0.4,
            position: [1, 3, 2],
          });
        });
      }
    };

    initializeMap();

    // Geocoding avec Mapbox Geocoding API
    const geocodeAddress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`,
        );

        const data = await response.json();

        if (data && data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lon, lat] = feature.center;
          setCoordinates([lon, lat]);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [lon, lat],
              zoom: zoom,
              essential: true,
              duration: 1500,
            });

            // Créer un nouveau marqueur s'il n'existe pas ou mettre à jour celui existant
            if (!markerRef.current) {
              // Créer un élément DOM personnalisé pour le marqueur
              const el = document.createElement("div");
              el.className = "custom-marker";
              el.innerHTML = `
                <div class="flex items-center justify-center w-10 h-10">
                  <div class="absolute w-6 h-6 bg-foreground/70 rounded-full opacity-30 animate-ping"></div>
                  <div class="relative flex items-center justify-center w-8 h-8 bg-foreground text-background rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                </div>
              `;

              markerRef.current = new mapboxgl.Marker(el)
                .setLngLat([lon, lat])
                .addTo(mapInstanceRef.current);

              // Ajouter une popup
              const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                  <div class="p-2">
                    <div class="font-semibold mb-1">${location}</div>
                    <div class="text-xs text-gray-500">${feature.place_name}</div>
                  </div>
                `);

              if (markerRef.current) {
                markerRef.current.setPopup(popup);
              }
            } else {
              markerRef.current.setLngLat([lon, lat]);
            }
          }
        } else {
          setError("Emplacement non trouvé");
        }
      } catch (error: unknown) {
        setError(
          typeof error === "string"
            ? error
            : "Erreur lors de la récupération de l'emplacement",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (location) {
      geocodeAddress();
    } else {
      setIsLoading(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    location,
    zoom,
    interactive,
    isMobile,
    isClientReady,
    mapStyle,
    onMapClick,
  ]); // 👈 AJOUTE onMapClick dans les deps

  const handleRecenter = () => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.flyTo({
        center: coordinates,
        zoom: zoom,
        pitch: 45,
        bearing: 0,
        duration: 1000,
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();

        if (coordinates) {
          mapInstanceRef.current.flyTo({
            center: coordinates,
            duration: 500,
          });
        }
      }
    }, 100);
  };

  // Fonction pour animier la rotation de la carte
  const animateMap = () => {
    if (!mapInstanceRef.current || !coordinates) return;

    // Effectuer une rotation de 360 degrés
    const rotationDuration = 12000; // 12 secondes
    const startBearing = 0;
    const endBearing = 360;
    const start = Date.now();

    function rotate() {
      if (!mapInstanceRef.current) return;

      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / rotationDuration, 1);
      const bearing = startBearing + progress * (endBearing - startBearing);

      mapInstanceRef.current.setBearing(bearing % 360);

      if (progress < 1) {
        requestAnimationFrame(rotate);
      }
    }

    rotate();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-xl overflow-hidden transition-all duration-300 ease-in-out",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "",
        className,
      )}
    >
      {!location && (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-muted/5 rounded-xl border border-muted/30 text-sm text-muted-foreground">
          <MapPin className="h-8 w-8 mb-2 text-muted-foreground/50" />
          <p>Aucune localisation définie</p>
        </div>
      )}

      {isLoading && location && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-foreground/70 mb-2" />
          <p className="text-sm">Chargement de la carte 3D...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          height: isFullscreen ? "100vh" : height,
          display: location ? "block" : "none",
        }}
        className="rounded-xl overflow-hidden z-0"
      />

      {interactive && location && (
        <div className="absolute bottom-16 right-3 z-10 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 ease-in-out"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 ease-in-out"
            onClick={handleRecenter}
          >
            <MapPin className="h-4 w-4" />
          </Button>

          {isFullscreen && (
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 ease-in-out"
              onClick={animateMap}
              title="Faire pivoter la carte"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7l3-3"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7l3 3"></path>
              </svg>
            </Button>
          )}
        </div>
      )}

      {isFullscreen && (
        <div className="absolute top-3 left-3 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 ease-in-out"
            onClick={toggleFullscreen}
          >
            Fermer
          </Button>
        </div>
      )}
    </div>
  );
}
