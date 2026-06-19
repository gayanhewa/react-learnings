import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";

// This route wraps its own subtree in AuthProvider so the lesson is
// self-contained. PROD: you'd hoist <AuthProvider> to the app root (main.tsx)
// so the whole app shares one session, exactly like a library's provider.
export default function Auth() {
  return (
    <AuthProvider>
      <AuthInner />
    </AuthProvider>
  );
}

function AuthInner() {
  const { user, loading } = useAuth();

  // CONCEPT: a route guard. While we check the session, render nothing
  // definitive; once known, show either the protected view or the login form.
  // PROD: with React Router this guard is often a route `loader` that redirects
  // to /login before the component renders (ties back to the /items lesson).
  if (loading) return <Shell><p>Checking session...</p></Shell>;
  return user ? <Protected /> : <LoginForm />;
}

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch {
      setError("Invalid credentials");
    }
  }

  return (
    <Shell>
      <p>Log in (demo creds are pre-filled).</p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.5rem", maxWidth: 280 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        {/* PROD: a password field - the browser handles it; we never store it. */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Log in</button>
      </form>
      {error && <p className="error">{error}</p>}
    </Shell>
  );
}

function Protected() {
  const { user, logout } = useAuth();
  return (
    <Shell>
      <p>
        You are logged in as <strong>{user?.email}</strong>. This view is gated by
        the session.
      </p>
      <p>
        The access token expires after 10s. Wait, then click "Call /api/me" - the
        first call 401s, authFetch silently refreshes, and the retry succeeds.
      </p>
      <CallMe />
      <button onClick={() => logout()}>Log out</button>
    </Shell>
  );
}

function CallMe() {
  const [result, setResult] = useState<string>("");
  async function call() {
    // Use authFetch so the 401 -> refresh -> retry happens transparently.
    const { authFetch } = await import("./authFetch");
    const res = await authFetch("/api/me");
    setResult(res.ok ? `200 OK: ${JSON.stringify(await res.json())}` : `${res.status}`);
  }
  return (
    <div style={{ margin: "0.5rem 0" }}>
      <button onClick={call}>Call /api/me</button>
      {result && <p><code>{result}</code></p>}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <h1>Auth (session management)</h1>
      {children}
    </section>
  );
}
