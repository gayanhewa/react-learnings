// Hooks are React's built-in functions for "remembering" data (useState)
// and running side-effects like network calls (useEffect).
import { useEffect, useState } from "react";
import { delay } from "../lib/delay";

// TypeScript type describing the shape of one item from the API.
type Item = { id: number; name: string };

// A component is just a function that returns the UI (JSX) to render.
// React re-runs this entire function whenever its state changes.
export default function Home() {
  // useState = component memory that survives re-renders.
  // Returns [currentValue, setterFn]. Update ONLY via the setter -
  // calling setItems(...) is what tells React to re-render. Never assign
  // `items = ...` directly; that won't update the screen.
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  // With useEffect fetching, YOU track loading yourself. Starts true, flips
  // false when the fetch settles. This is the manual work a loader removes.
  const [loading, setLoading] = useState(true);

  // useEffect runs AFTER the component renders - the right place for
  // side-effects like fetching data. The empty [] dependency array means
  // "run this once, when the component first mounts." (No array at all
  // would re-run it every render → fetch → setState → render → infinite loop.)
  //
  // The effect callback itself canNOT be async: an async function returns a
  // Promise, but React expects the callback to return either nothing or a
  // cleanup function. So we define an async function inside and call it.
  useEffect(() => {
    async function load() {
      try {
        await delay(1000); // artificial delay so the loading state is visible
        const res = await fetch("/api/items");
        // fetch only rejects on network failure, not on HTTP errors,
        // so check res.ok and throw manually for 4xx/5xx responses.
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Store the data in state - this triggers a re-render with the items.
        setItems(await res.json());
      } catch (err) {
        // Any thrown error (network or HTTP) lands here and goes into state.
        setError(String(err));
      } finally {
        // Runs whether we succeeded or failed - turn the loading flag off.
        setLoading(false);
      }
    }
    // Kick it off. The effect callback returns undefined (not the Promise),
    // which keeps React's cleanup contract happy.
    load();
  }, []);

  // The return value is JSX: HTML-like syntax that compiles to JS.
  // It re-runs and updates the DOM automatically whenever state changes.
  return (
    <section>
      <h1>Home</h1>
      <p>Items fetched from the API:</p>
      {/* {expr} embeds JS in JSX. Render the error line only if error is set. */}
      {error && <p className="error">Failed to load: {error}</p>}
      {/* Show a placeholder while loading is true - the component-managed
          loading state you have to wire up yourself with useEffect. */}
      {loading && <p>Loading...</p>}
      <ul>
        {/* .map() turns each data item into an <li>. `key` must be a stable,
            unique id so React can track list items efficiently across renders. */}
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </section>
  );
}
