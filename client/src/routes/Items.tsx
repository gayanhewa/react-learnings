import { useLoaderData } from "react-router-dom";
import { delay } from "../lib/delay";

// Shape of one item from the API.
type Item = { id: number; name: string };

// A DISCRIMINATED UNION: the loader returns ONE of these two shapes. The
// literal `ok: true` / `ok: false` field is the "discriminant" - the tag
// TypeScript uses to tell the variants apart. Checking `data.ok` lets the
// compiler narrow to exactly one variant, so `items` and `error` are each
// only reachable in their own branch. No casts, no `as` - the type system
// does the work.
type LoaderResult =
  | { ok: true; items: Item[] }
  | { ok: false; error: string };

// A loader is a plain async function tied to the route in the routing table.
// React Router runs it BEFORE rendering this component, waits for it to
// resolve, then renders - so the data is already here on first paint.
//
// The explicit `Promise<LoaderResult>` return type is what makes the union
// flow through to the component: every return below must match one variant,
// and useLoaderData<typeof itemsLoader>() infers this same type - no cast.
//
// NOTE: an alternative React Router idiom is to THROW on failure; the router
// then renders the route's `errorElement` (read via useRouteError()) and this
// component only ever sees success. Returning the union instead keeps both
// cases in one place, which is the clearer demonstration of narrowing.
export async function itemsLoader(): Promise<LoaderResult> {
  await delay(1000); // artificial delay - navigation blocks here until done
  try {
    const res = await fetch("/api/items");
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    // Pure-TS version: we trust the JSON is Item[]. (A runtime schema check,
    // e.g. Zod, would belong right here to make the success branch airtight.)
    const items: Item[] = await res.json();
    return { ok: true, items };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export default function Items() {
  // Typed inference from the loader's signature - no `as` cast. The generic
  // <typeof itemsLoader> tells useLoaderData the return type, so `data` is
  // LoaderResult here purely through inference.
  const data = useLoaderData<typeof itemsLoader>();

  // The discriminant check. After this `if`, TypeScript KNOWS `data` is the
  // error variant inside the block, and the success variant after it - try
  // accessing data.items here and it's a compile error.
  if (!data.ok) {
    return (
      <section>
        <h1>Items (loader)</h1>
        <p className="error">Failed to load: {data.error}</p>
      </section>
    );
  }

  // Past the guard, `data` is narrowed to { ok: true; items: Item[] } - so
  // data.items is fully typed and safe to use with no cast.
  return (
    <section>
      <h1>Items (loader)</h1>
      <p>
        Same data as Home, but fetched by a route <code>loader</code> before
        render - notice there's no loading flash.
      </p>
      <ul>
        {data.items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </section>
  );
}
