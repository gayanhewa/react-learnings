import { useReducer } from "react";

// ---------------------------------------------------------------------------
// PART 1: COMPOSITION via children
// ---------------------------------------------------------------------------

// CONCEPT: instead of configuring a component with a dozen props, you let the
// CALLER pass JSX as `children`. The component owns the structure/styling; the
// caller owns the content. "Composition over configuration."
// PROD: this is how design systems are built - a <Card> doesn't take a `title`
// and `body` prop, it takes children, so it works for any content. Fewer props,
// infinitely flexible. React.ReactNode is the type for "any renderable thing."
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #e2e2e2",
        borderRadius: 6,
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      {children}
    </div>
  );
}

// A compound component: Card.Header and Card.Body share the Card's context of
// "being inside a card" purely by where the caller places them. No prop wiring.
Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{children}</div>;
};

// ---------------------------------------------------------------------------
// PART 2: useReducer for complex local state
// ---------------------------------------------------------------------------

type State = { count: number; step: number };
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "setStep"; step: number }
  | { type: "reset" };

// CONCEPT: useReducer is useState's bigger sibling. When state has multiple
// related fields and several ways to transition, a reducer centralizes that
// logic in one pure function instead of scattering setState calls.
// PROD: if you know Redux, this IS Redux's reducer pattern, built into React and
// scoped to one component. Reach for it when useState branches get tangled, or
// when the next transition depends on the current state in non-trivial ways.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "setStep":
      return { ...state, step: action.step };
    case "reset":
      return { count: 0, step: 1 };
  }
}

export default function Patterns() {
  // dispatch sends an action; the reducer computes the next state. Components
  // describe WHAT happened ("increment"), not HOW state changes - that's in the reducer.
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <section>
      <h1>Patterns (composition + useReducer)</h1>

      <Card>
        <Card.Header>Composition</Card.Header>
        <p>
          This card takes no <code>title</code>/<code>body</code> props - it
          renders whatever children you nest inside it.
        </p>
      </Card>

      <Card>
        <Card.Header>useReducer</Card.Header>
        <p>
          Count: <strong>{state.count}</strong> (step {state.step})
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <button onClick={() => dispatch({ type: "decrement" })}>-</button>
          <button onClick={() => dispatch({ type: "increment" })}>+</button>
          <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
        </div>
        <label>
          Step:{" "}
          <input
            type="number"
            value={state.step}
            onChange={(e) =>
              dispatch({ type: "setStep", step: Number(e.target.value) || 1 })
            }
            style={{ width: 60 }}
          />
        </label>
      </Card>
    </section>
  );
}
