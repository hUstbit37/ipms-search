"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCompanies, getCompanyById } from "@/lib/api/companyApi";
import type { Company } from "@/lib/api/companyApi";

export const useAllCompanies = () => {
  const query = useQuery({
    queryKey: ["all-companies"],
    queryFn: () => getAllCompanies(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    companies: query.data || ([] as Company[]),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useCompany = (id?: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => (id ? getCompanyById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
};
