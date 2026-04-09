import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Monorepo: npm hoists react/react-dom to repo root; Vite must resolve them explicitly.
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
    alias: {
      react: path.resolve(workspaceRoot, "node_modules/react"),
      "react-dom": path.resolve(workspaceRoot, "node_modules/react-dom"),
    },
  },
  server: {
    fs: {
      allow: [workspaceRoot],
    },
  },
});
