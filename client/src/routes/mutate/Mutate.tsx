import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Item = { id: number; name: string };

async function fetchItems(): Promise<Item[]> {
  const res = await fetch("/api/items");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function createItem(name: string): Promise<Item> {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export default function Mutate() {
  const [name, setName] = useState("");

  // CONCEPT: the QueryClient (the cache) is reachable from any component via this
  // hook. We need it to invalidate cached queries after a successful write.
  const queryClient = useQueryClient();

  // This is the SAME queryKey the /query route uses. Sharing the key means both
  // routes read one cache entry - invalidating it here updates /query too.
  const itemsQuery = useQuery({ queryKey: ["items"], queryFn: fetchItems });

  // CONCEPT: useMutation is the write-side counterpart to useQuery. useQuery is
  // for reads (GET); useMutation is for writes (POST/PUT/DELETE) - things with
  // side effects you trigger explicitly via mutate(), not on render.
  // PROD: this is how server state actually gets updated in a TanStack app. The
  // pattern is: mutate -> on success, invalidate the affected queries so every
  // screen showing that data refetches and stays consistent. No manual state sync.
  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      // CONCEPT: invalidateQueries marks the cached ["items"] as stale and
      // refetches it. Any component using that key (here AND on /query) updates.
      // PROD: this is the cache-consistency mechanism. One write, every reader
      // refreshes - the reason you don't hand-wire "after save, also update X".
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setName("");
    },
    // GOTCHA: like fetch, the mutationFn must THROW on failure for onError to
    // fire and isError to flip. A non-throwing 4xx would look like success.
  });

  return (
    <section>
      <h1>Mutate (useMutation + invalidation)</h1>
      <p>
        Add an item with <code>useMutation</code>, then invalidate the{" "}
        <code>["items"]</code> cache. Open <code>/query</code> in another tab and
        add here - that list updates because both share the cache key.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMutation.mutate(name.trim());
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          autoComplete="off"
        />
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving..." : "Add"}
        </button>
      </form>

      {createMutation.isError && (
        <p className="error">Failed: {String(createMutation.error)}</p>
      )}

      {itemsQuery.isPending ? (
        <p>Loading...</p>
      ) : itemsQuery.isError ? (
        <p className="error">Failed to load list</p>
      ) : (
        <ul>
          {itemsQuery.data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
