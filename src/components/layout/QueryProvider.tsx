"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/lib/query/client";

/**
 * Client-side QueryClientProvider wrapper.
 *
 * The QueryClient is created once on mount via `useState` initializer so
 * it persists across re-renders but is unique per browser tab / SSR request.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
