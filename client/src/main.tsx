import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import Home from "./routes/Home";
import About from "./routes/About";
import Items, { itemsLoader } from "./routes/Items";
import Query from "./routes/query/Query";
import NewItem from "./routes/new-item/NewItem";
import Dashboard from "./routes/dashboard/Dashboard";
import Mutate from "./routes/mutate/Mutate";
import Patterns from "./routes/patterns/Patterns";
import Auth from "./routes/auth/Auth";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      // `loader` runs before <Items> renders; its return value feeds
      // useLoaderData() inside the component.
      { path: "items", element: <Items />, loader: itemsLoader },
      { path: "query", element: <Query /> },
      { path: "new-item", element: <NewItem /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "mutate", element: <Mutate /> },
      { path: "patterns", element: <Patterns /> },
      { path: "auth", element: <Auth /> },
      { path: "about", element: <About /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* CONCEPT: QueryClientProvider makes the one QueryClient (the cache)
        available to every component below via React Context. Every useQuery
        in the tree shares this single cache.
        PROD: wraps your whole app exactly once, near the root - same place
        you'd put an auth provider or a theme provider. */}
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
