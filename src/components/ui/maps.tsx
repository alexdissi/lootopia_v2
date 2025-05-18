"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface MapViewProps {
  location: string;
  height?: string;
  zoom?: number;
  className?: string;
  interactive?: boolean;
}

export function MapView({
  location,
  height = "200px",
  zoom = 13,
  className,
  interactive = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: interactive && !isMobile,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
      }).setView([0, 0], zoom);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(mapInstanceRef.current);

      const icon = L.divIcon({
        html: `<div class="flex items-center justify-center w-10 h-10">
                <div class="absolute w-6 h-6 bg-foreground/70 rounded-full opacity-30 animate-ping"></div>
                <div class="relative flex items-center justify-center w-8 h-8 bg-foreground text-background rounded-full shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
              </div>`,
        className: "custom-div-icon",
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      // Créer un marqueur avec l'icône personnalisée
      markerRef.current = L.marker([0, 0], { icon }).addTo(
        mapInstanceRef.current,
      );
    }

    const geocodeAddress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
        );

        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const coordinates = [Number.parseFloat(lat), Number.parseFloat(lon)];

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(
              coordinates as L.LatLngExpression,
              zoom,
            );

            if (markerRef.current) {
              markerRef.current.setLatLng(coordinates as L.LatLngExpression);

              markerRef.current
                .bindPopup(
                  `<div class="p-1">
                  <div class="font-semibold mb-1">${location}</div>
                  <div class="text-xs text-gray-500">${display_name}</div>
                </div>`,
                )
                .openPopup();
            }
          }
        } else {
          setError("Emplacement non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors du géocodage :", error);
        setError("Erreur de chargement de la carte");
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
  }, [location, zoom, interactive, isMobile]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(markerRef.current.getLatLng(), zoom);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();

        if (markerRef.current) {
          mapInstanceRef.current.setView(markerRef.current.getLatLng(), zoom);
        }
      }
    }, 100);
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
          <p className="text-sm">Chargement de la carte...</p>
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

      {location && !isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs text-center bg-background/80 backdrop-blur-sm border-t border-muted/30 z-10 transition-all duration-300 ease-in-out">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline inline-flex items-center transition-colors duration-200"
          >
            <span>Voir sur Google Maps</span>
            <svg
              className="h-3 w-3 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
