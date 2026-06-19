import { useActionState, useOptimistic, useRef } from "react";
import { useFormStatus } from "react-dom";

type Item = { id: number; name: string };

// CONCEPT: the API call lives outside the component - a plain async function,
// same discipline as the queryFn in the /query lesson.
// PROD: returns the canonical server record (with the real id). The client
// should trust THIS, not the optimistic guess it showed a moment ago.
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

export default function NewItem() {
  const formRef = useRef<HTMLFormElement>(null);

  // CONCEPT: useActionState manages the whole submit lifecycle. You give it an
  // async "action" (state, formData) => newState. React tracks pending for you
  // and re-runs the action when the <form action={...}> is submitted.
  // The first slot is the latest returned state; the third is the bound action.
  // PROD: this is the React 19 native replacement for wiring up onSubmit +
  // useState(loading) + try/catch by hand. For COMPLEX forms (many fields,
  // cross-field validation) you'd still reach for React Hook Form + Zod.
  const [items, submitAction] = useActionState<Item[], FormData>(
    async (prev, formData) => {
      const name = String(formData.get("name") ?? "").trim();
      if (!name) return prev; // trivial client-side guard
      try {
        const created = await createItem(name);
        formRef.current?.reset();
        return [...prev, created]; // commit the REAL server record
      } catch (err) {
        // GOTCHA: returning prev here discards the optimistic row (rollback).
        // We surface the error via the optimistic layer below instead of state.
        alert(String(err)); // demo-simple; a real app shows inline error UI
        return prev;
      }
    },
    [],
  );

  // CONCEPT: useOptimistic shows a temporary, predicted result WHILE the action
  // is in flight, then automatically reverts to the real `items` when it settles.
  // optimisticItems = the list to render; addOptimistic queues a fake entry.
  // PROD: this is "optimistic UI" - the row appears instantly (id: -1 placeholder)
  // for a snappy feel; if the server rejects, React drops it on its own when the
  // action returns the unchanged list. Same idea as TanStack's onMutate/rollback.
  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (current, newName: string) => [...current, { id: -1, name: newName }],
  );

  return (
    <section>
      <h1>New item (React 19 form hooks)</h1>
      <p>
        Add an item. It appears instantly (optimistic) before the 1s server
        round-trip. Type a name containing <code>fail</code> to watch the server
        reject it and the optimistic row roll back.
      </p>

      {/* CONCEPT: React 19 forms use action={fn} instead of onSubmit. The form
          auto-resets pending state and passes FormData to the action. */}
      <form
        ref={formRef}
        action={(formData) => {
          // Fire the optimistic update first, then the real action.
          addOptimistic(String(formData.get("name") ?? ""));
          submitAction(formData);
        }}
      >
        <input name="name" placeholder="Item name" autoComplete="off" />
        <SubmitButton />
      </form>

      <ul>
        {optimisticItems.map((item, i) => (
          // id is -1 for the in-flight optimistic row; fall back to index key.
          <li key={item.id === -1 ? `pending-${i}` : item.id}>
            {item.name}
            {item.id === -1 && <em> (saving...)</em>}
          </li>
        ))}
      </ul>
    </section>
  );
}

// CONCEPT: useFormStatus reads the pending state of the NEAREST parent <form>,
// from a child component - no prop drilling. Must be in a child, not the form
// component itself.
// PROD: lets shared UI (a submit button, a spinner) know it's submitting without
// the parent passing a `loading` prop down. Great for design-system buttons.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add"}
    </button>
  );
}
