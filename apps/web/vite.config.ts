import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const appDir = path.dirname(fileURLToPath(import.meta.url));
/** Only treat `../../` as the monorepo root when this package lives at `apps/web`. */
const workspaceRoot =
  path.basename(appDir) === "web" && path.basename(path.dirname(appDir)) === "apps"
    ? path.resolve(appDir, "../..")
    : appDir;

/** When npm hoists react to the monorepo root, point Vite there; otherwise use local `node_modules`. */
function hoistedReactAliases(): Record<string, string> | undefined {
  const rootReact = path.join(workspaceRoot, "node_modules/react");
  if (fs.existsSync(rootReact)) {
    return {
      react: path.join(workspaceRoot, "node_modules/react"),
      "react-dom": path.join(workspaceRoot, "node_modules/react-dom"),
    };
  }
  return undefined;
}

const reactAlias = hoistedReactAliases();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
    ...(reactAlias ? { alias: reactAlias } : {}),
  },
  server: {
    fs: {
      allow: reactAlias ? [workspaceRoot, appDir] : [appDir],
    },
  },
});
