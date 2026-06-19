import { QueryClient } from "@tanstack/react-query";

// CONCEPT: The QueryClient is TanStack Query's cache + config. One instance for
// the whole app; every useQuery/useMutation reads and writes through it.
//
// PROD: This is where teams set global policy - how long data stays "fresh"
// before a background refetch, retry/backoff on failure, refetch-on-focus, etc.
// Think of it as the client-side equivalent of your HTTP cache / connection-pool
// config: set once, applied everywhere.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // CONCEPT: "fresh" data is served from cache with NO network call. After
      // staleTime it becomes "stale" and the next use triggers a background
      // refetch (you still see cached data instantly while it revalidates).
      // PROD: tune per data volatility - a user profile might be minutes,
      // a stock ticker seconds. Here 30s so you can observe the behavior.
      staleTime: 30_000,
      // PROD: real APIs blip. TanStack retries failed queries with backoff by
      // default (3x). Lowered to 1 here to keep the demo's errors quick to see.
      retry: 1,
    },
  },
});
