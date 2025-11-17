"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect, ComponentType } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  // Devtools component typed with the only prop we use to avoid 'any'
  const [DevtoolsComp, setDevtoolsComp] = useState<ComponentType<{
    initialIsOpen?: boolean;
  }> | null>(null);

  useEffect(() => {
    // Dynamically import devtools only in development and if package is installed
    if (process.env.NODE_ENV === "development") {
      import("@tanstack/react-query-devtools")
        .then((mod) => setDevtoolsComp(() => mod.ReactQueryDevtools))
        .catch(() => {
          // ignore if not installed
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {DevtoolsComp ? <DevtoolsComp initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
