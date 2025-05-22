"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
}

interface LocationResult {
  display_name: string;
  place_id: number;
}

async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 3) return [];

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
  );

  if (!response.ok) {
    throw new Error("Échec de la recherche de lieux");
  }

  return response.json();
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "Rechercher un lieu...",
  className,
  onBlur,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [searchTerm, setSearchTerm] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchro quand la prop value change
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["locationSearch", searchTerm],
    queryFn: () => searchLocations(searchTerm),
    enabled: searchTerm.length >= 3,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleInputChange = (input: string) => {
    setInputValue(input);

    // Annuler le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer un nouveau timeout pour la recherche
    timeoutRef.current = setTimeout(() => {
      setSearchTerm(input);
      if (input.length >= 3) {
        setOpen(true);
      }
    }, 300);
  };

  // Nettoyer le timeout lors du démontage
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleSelect = (location: string) => {
    setInputValue(location);
    onChange(location);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        onClick={() => inputValue.length >= 3 && setOpen(true)}
        onFocus={() => inputValue.length >= 3 && setOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            if (onBlur) onBlur();
            onChange(inputValue);
          }, 100);
        }}
        className={cn("w-full", className)}
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {open && inputValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-popover shadow-md border rounded-md overflow-hidden">
          <Command>
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={result.place_id}
                    onSelect={() => handleSelect(result.display_name)}
                    className="cursor-pointer"
                  >
                    {result.display_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
