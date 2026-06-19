/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Express server (avoids CORS in dev)
      "/api": "http://localhost:3001",
    },
  },
  // Vitest config lives here too (Vitest reads the Vite config).
  test: {
    environment: "jsdom", // a fake DOM so React can render in Node
    globals: true, // describe/it/expect available without importing
    setupFiles: ["./src/test/setup.ts"],
  },
});
