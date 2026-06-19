import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggle: () => void };

// CONCEPT: Context lets you share a value with any descendant WITHOUT passing it
// through every intermediate component as props ("prop drilling"). Three steps:
// (1) createContext, (2) a Provider supplying the value, (3) useContext to read.
// PROD: the canonical use cases are app-wide, rarely-changing values - the
// current user/auth, theme, locale, feature flags. React's BUILT-IN tool, zero deps.
const ThemeContext = createContext<ThemeContextValue | null>(null);

// (2) The Provider. Anything rendered inside <ThemeProvider> can read the value.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  // GOTCHA: when this value changes, EVERY component calling useContext here
  // re-renders - Context has no built-in selective subscription. Fine for a
  // theme; a footgun for high-frequency state (that's a reason Zustand exists).
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// (3) A typed hook so consumers can't forget the Provider (null check in one place).
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
