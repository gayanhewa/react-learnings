import { Link, Outlet, useNavigation } from "react-router-dom";

export default function App() {
  // useNavigation() exposes the router's global navigation state. While any
  // route loader is running, state === "loading". This is how you surface
  // loading with loaders: the target component hasn't rendered yet (the
  // loader blocks navigation), so you show a pending indicator HERE in the
  // persistent layout instead of inside the page.
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  return (
    <div className="container">
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/items">Items</Link>
        <Link to="/query">Query</Link>
        <Link to="/new-item">New item</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/mutate">Mutate</Link>
        <Link to="/patterns">Patterns</Link>
        <Link to="/about">About</Link>
      </nav>
      {/* Top-level pending bar - appears during any loader-driven navigation
          (e.g. clicking "Items"). Compare with Home's "Loading..." which lives
          inside the page and is wired up manually with useState. */}
      {isNavigating && <div className="loading-bar">Navigating...</div>}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
