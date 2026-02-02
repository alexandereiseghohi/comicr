"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

import { getQueryClient } from "@/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Get the query client (singleton on client, new instance on server)
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools buttonPosition="bottom-right" initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
