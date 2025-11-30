import { QueryClient, DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 60 * 1000,
  },
};

export { QueryClientProvider } from "@tanstack/react-query";
export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export * from "@tanstack/react-query";
