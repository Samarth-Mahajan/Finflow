import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

const DEFAULT_STALE_TIME_MS = 30_000;
const DEFAULT_GC_TIME_MS = 5 * 60 * 1000;

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: DEFAULT_STALE_TIME_MS,
    gcTime: DEFAULT_GC_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  },
};

/**
 * Creates a new QueryClient with FinFlow defaults.
 *
 * Call this inside a component or provider so that each React tree
 * (and each SSR request) gets its own client instance.
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({ defaultOptions });
};
