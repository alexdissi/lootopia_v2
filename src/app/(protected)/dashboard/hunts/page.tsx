"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Search, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Hunt {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  mode: "PUBLIC" | "PRIVATE";
  fee: number | null;
  createdAt: string;
  _count: {
    participants: number;
  };
}

export default function HuntsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchHunts = async (userOnly: boolean = false): Promise<Hunt[]> => {
    let url = "/api/hunt";
    const params = new URLSearchParams();

    if (userOnly) params.append("userOnly", "true");
    if (statusFilter) params.append("status", statusFilter);

    if (params.toString()) {
      url += "?" + params.toString();
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch hunts");
    return res.json();
  };

  const {
    data: allHunts,
    isLoading: isLoadingAll,
    error: allError,
  } = useQuery({
    queryKey: ["hunts", "all", statusFilter],
    queryFn: () => fetchHunts(false),
  });

  const {
    data: myHunts,
    isLoading: isLoadingMine,
    error: myError,
  } = useQuery({
    queryKey: ["hunts", "mine", statusFilter],
    queryFn: () => fetchHunts(true),
  });

  const getStatusBadge = (status: string) => {
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
  };

  const filterHunts = (hunts: Hunt[] | undefined) => {
    if (!hunts) return [];
    return hunts.filter(
      (hunt) =>
        hunt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hunt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hunt.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredAllHunts = filterHunts(allHunts);
  const filteredMyHunts = filterHunts(myHunts);

  if (allError || myError) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Une erreur s'est produite</h1>
        <p className="text-muted-foreground mb-4">
          Impossible de charger les chasses au trésor.
        </p>
        <Button onClick={() => window.location.reload()}>
          Rafraîchir la page
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Chasses au trésor</h1>
        <Link href="/dashboard/hunts/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Créer une chasse
          </Button>
        </Link>
      </div>

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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Toutes les chasses</TabsTrigger>
          <TabsTrigger value="mine">Mes chasses</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : filteredAllHunts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllHunts.map((hunt) => (
                <Card key={hunt.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl line-clamp-1">
                        {hunt.title}
                      </CardTitle>
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

                  <CardContent>
                    <p className="text-sm line-clamp-3 mb-4">
                      {hunt.description || "Aucune description"}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      {hunt.location ? (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span className="line-clamp-1">{hunt.location}</span>
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

                  <CardFooter className="pt-0">
                    <Link
                      href={`/dashboard/hunts/${hunt.id}`}
                      className="w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Voir les détails
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucune chasse au trésor trouvée
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {isLoadingMine ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : filteredMyHunts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyHunts.map((hunt) => (
                <Card key={hunt.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl line-clamp-1">
                        {hunt.title}
                      </CardTitle>
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

                  <CardContent>
                    <p className="text-sm line-clamp-3 mb-4">
                      {hunt.description || "Aucune description"}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      {hunt.location ? (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span className="line-clamp-1">{hunt.location}</span>
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
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Voir
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/hunts/${hunt.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="default" size="sm" className="w-full">
                        Modifier
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Vous n'avez pas encore créé de chasse au trésor
              </p>
              <Link href="/dashboard/hunts/create">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer ma première chasse
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
