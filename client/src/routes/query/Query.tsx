import { useQuery } from "@tanstack/react-query";
import { delay } from "../../lib/delay";

type Item = { id: number; name: string };

// CONCEPT: A plain async function that fetches and returns typed data. Notice
// it has NO React in it - no hooks, no state. It's just "how to get the data."
// TanStack Query calls this for you and manages everything around it.
// PROD: this is your API client layer. In a real app these live in one place
// (e.g. src/api/) and are reused by every query, so caching keys line up.
async function fetchItems(): Promise<Item[]> {
  await delay(1000); // artificial delay so loading/cached states are visible
  const res = await fetch("/api/items");
  // GOTCHA: TanStack treats a REJECTED promise as the error state. fetch does
  // NOT reject on 4xx/5xx, so you must throw yourself - otherwise a 500 looks
  // like success with garbage data.
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function Query() {
  // CONCEPT: useQuery replaces ALL of Home's manual machinery - the useState
  // for data, the useState for loading, the useState for error, AND the
  // useEffect - with one call. You give it:
  //   - queryKey: the cache identity for this data (like a cache key / URL)
  //   - queryFn:  how to fetch it
  // and it hands back data + status flags, fully typed from fetchItems.
  //
  // PROD: queryKey is the heart of the system. Two components using the same
  // key share one cache entry and one in-flight request (automatic dedup).
  // Mutations later invalidate BY key to force a refetch. Keys are usually
  // structured like ["items"] or ["items", { filter }] - think cache namespacing.
  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  // CONCEPT: isPending = no cached data yet (first load). isFetching = a request
  // is in flight, INCLUDING background refetches when you already have data.
  // GOTCHA: the distinction matters - on a background refetch you keep showing
  // the old data (isFetching true, isPending false) instead of a blank loader.
  if (isPending) return <Shell><p>Loading...</p></Shell>;
  if (isError) return <Shell><p className="error">Failed: {String(error)}</p></Shell>;

  return (
    <Shell>
      {/* isFetching here = a background revalidation while showing cached data */}
      {isFetching && <p className="loading-bar">Revalidating...</p>}
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      {/* CONCEPT: refetch() forces a fresh fetch on demand. Click it, then
          navigate away and back within 30s (staleTime) - you'll see the cached
          data appear INSTANTLY with no loader, the payoff of the cache. */}
      <button onClick={() => refetch()}>Refetch</button>
    </Shell>
  );
}

// Small layout wrapper so the three return branches share the same heading.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <h1>Query (TanStack Query)</h1>
      <p>
        Same data as Home, but fetched with <code>useQuery</code>. Try: navigate
        away and back within 30s - cached, instant, no loader.
      </p>
      {children}
    </section>
  );
}
