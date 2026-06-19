import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "./authFetch";

type User = { id: number; email: string };
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// CONCEPT: the auth context - the /dashboard Context pattern applied to a real
// concern. Any component can call useAuth() to read the current user or log in/out.
// PROD: this is what a library's <AuthProvider> + useUser()/useSession() give you.
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, ask the server who we are. authFetch will silently refresh if the
  // access token is stale. This is how the session "survives a page reload"
  // even though JS never sees the httpOnly token.
  useEffect(() => {
    authFetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await authFetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("invalid credentials");
    const data = await res.json();
    setUser(data.user);
  }

  async function logout() {
    await authFetch("/api/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
