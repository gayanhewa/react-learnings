import { ThemeProvider, useTheme } from "./ThemeContext";
import { useCounterStore } from "./counterStore";

export default function Dashboard() {
  // CONCEPT: the Provider wraps only the subtree that needs the theme. You could
  // hoist it to the app root (like in main.tsx) if the whole app needed it.
  return (
    <ThemeProvider>
      <DashboardInner />
    </ThemeProvider>
  );
}

function DashboardInner() {
  // Context: read via the typed hook. This component re-renders on theme change.
  const { theme, toggle } = useTheme();

  return (
    <section
      style={{
        background: theme === "dark" ? "#1a1a1a" : "#fff",
        color: theme === "dark" ? "#f5f5f5" : "#1a1a1a",
        padding: "1rem",
        borderRadius: 6,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      <h1>Dashboard (client state)</h1>
      <p>
        Two kinds of CLIENT state - no server involved. Contrast with{" "}
        <code>/query</code>, which manages SERVER state.
      </p>

      <h2>Theme - React Context</h2>
      <p>
        Current: <strong>{theme}</strong>
      </p>
      <button onClick={toggle}>Toggle theme</button>

      <h2>Counter - Zustand</h2>
      {/* CONCEPT: two separate components read the SAME Zustand store with
          selectors. They share state with zero prop passing and no Provider. */}
      <CounterDisplay />
      <CounterButtons />
    </section>
  );
}

// Reads only `count` via a selector - re-renders only when count changes.
function CounterDisplay() {
  const count = useCounterStore((s) => s.count);
  return (
    <p>
      Count: <strong>{count}</strong>
    </p>
  );
}

// Reads only the actions. PROD: selecting just the functions means this button
// component never re-renders on count changes - the selective-subscription win.
function CounterButtons() {
  const increment = useCounterStore((s) => s.increment);
  const reset = useCounterStore((s) => s.reset);
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
