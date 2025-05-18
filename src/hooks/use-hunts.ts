"use client";

import { useQuery } from "@tanstack/react-query";
import type { Hunt } from "@/interfaces/hunt";

export function useHunts(statusFilter: string | null) {
  const fetchHunts = async (userOnly = false): Promise<Hunt[]> => {
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

  return {
    allHunts,
    myHunts,
    isLoadingAll,
    isLoadingMine,
    error: allError || myError,
  };
}
