import { create } from "zustand";

type CounterState = {
  count: number;
  increment: () => void;
  reset: () => void;
};

// CONCEPT: Zustand creates a store OUTSIDE the React tree. No Provider to wrap
// the app, no Context boilerplate. `set` updates state; any component that reads
// the store re-renders when ITS slice changes.
// PROD: the pragmatic default for client state in 2026 - global UI state (modals,
// sidebar open, wizard step, cart) that many unrelated components touch. Lives in
// its own file like this; import the hook anywhere. State + actions colocated.
export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));

// GOTCHA / the key advantage over Context: components subscribe with a SELECTOR,
// e.g. useCounterStore((s) => s.count). A component selecting only `count` does
// NOT re-render when an unrelated field changes. Context can't do this - every
// consumer re-renders on any change. That selective subscription is why Zustand
// scales to frequently-updated state where Context would thrash.
