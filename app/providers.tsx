"use client";

import { queryClient, QueryClientProvider } from "@/lib/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: {children: React.ReactNode}) {

  return (
    <QueryClientProvider client={ queryClient }>
      { children }
      <ReactQueryDevtools initialIsOpen={ false }/>
    </QueryClientProvider>
  );
}
