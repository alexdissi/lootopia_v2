"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HuntsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

export function HuntsFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: HuntsFiltersProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une chasse..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Select
        value={statusFilter === null ? "all" : statusFilter}
        onValueChange={(value) =>
          setStatusFilter(value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="PENDING">En attente</SelectItem>
          <SelectItem value="IN_PROGRESS">En cours</SelectItem>
          <SelectItem value="COMPLETED">Terminées</SelectItem>
          <SelectItem value="CANCELLED">Annulées</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
