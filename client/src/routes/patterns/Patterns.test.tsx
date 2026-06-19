import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Patterns from "./Patterns";

// CONCEPT: React Testing Library tests BEHAVIOR through the rendered UI, the way
// a user experiences it - find elements by their visible text/role, click them,
// assert on what changed. It deliberately does NOT let you reach into component
// internals (state, the reducer fn). If a test passes, the user-facing behavior works.
// PROD: this is the standard React testing approach. Tests survive refactors
// because they assert on outcomes ("count shows 2"), not implementation
// ("useReducer was called"). Rewrite the component internals and the test still holds.

describe("Patterns - useReducer behavior", () => {
  it("increments the count by the current step", async () => {
    const user = userEvent.setup();
    render(<Patterns />);

    // Find by visible text, like a user would. Starts at 0.
    expect(screen.getByText(/Count:/)).toHaveTextContent("Count: 0");

    // getByRole("button", { name }) finds the button by its accessible label.
    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText(/Count:/)).toHaveTextContent("Count: 1");
  });

  it("respects a changed step value", async () => {
    const user = userEvent.setup();
    render(<Patterns />);

    const stepInput = screen.getByLabelText(/Step:/);
    // fireEvent.change sets the value atomically - the reliable way to drive a
    // controlled input when simulating per-keystroke typing is flaky (here a
    // number input in jsdom). It fires a single onChange with the final value.
    fireEvent.change(stepInput, { target: { value: "5" } });

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText(/Count:/)).toHaveTextContent("Count: 5");
  });

  it("resets count and step", async () => {
    const user = userEvent.setup();
    render(<Patterns />);

    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText(/Count:/)).toHaveTextContent("Count: 0");
  });
});
