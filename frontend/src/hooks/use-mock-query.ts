import { useQuery } from '@tanstack/react-query'

/**
 * This is the single seam between the UI and a future real API.
 * Today it resolves local mock data with a tiny simulated latency so that
 * loading skeletons are exercised. Swap `loader` for a `fetch()` call when a
 * backend becomes available — no page components need to change.
 */
export function useMockQuery<T>(key: string, loader: () => T, delay = 220) {
  return useQuery<T>({
    queryKey: ['mock', key],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, delay))
      return loader()
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
