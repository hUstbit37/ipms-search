"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllAgencies, getAgencyById } from "@/lib/api/agencyApi";
import type { Agency } from "@/lib/api/agencyApi";

export const useAllAgencies = () => {
  const query = useQuery({
    queryKey: ["all-agencies"],
    queryFn: () => getAllAgencies(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    agencies: query.data || ([] as Agency[]),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useAgency = (id?: string) => {
  return useQuery({
    queryKey: ["agency", id],
    queryFn: () => (id ? getAgencyById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
};

