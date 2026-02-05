"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type ComponentProps, lazy, type ReactNode, Suspense } from "react";

import { getQueryClient } from "@/lib/query-client";

import type { Session } from "@/types/auth";

const Toaster = lazy(() => import("@/components/ui/sonner").then((module_) => ({ default: module_.Toaster })));
type ProvidersProps = {
  children: ReactNode;
  session?: null | Session;
} & ComponentProps<typeof ThemeProvider>;

export default function Providers({ children, attribute, defaultTheme, enableSystem }: ProvidersProps) {
  // Get the query client (singleton on client, new instance on server)
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem={enableSystem}>
          {children}
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools buttonPosition="bottom-right" initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
