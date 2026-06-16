import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");

function parseAllowedHosts(value: string | undefined) {
  return value
    ?.split(",")
    .map((host) => host.trim())
    .filter(Boolean) ?? [];
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, "");
  const port = Number(process.env.PORT ?? 5173);
  const basePath = process.env.BASE_PATH ?? env.BASE_PATH ?? "/";
  const allowedHosts = [
    "atelier-ai.replit.app",
    "ateliertech.vercel.app",
    ...parseAllowedHosts(process.env.REPLIT_DOMAINS),
    ...parseAllowedHosts(env.REPLIT_DOMAINS),
  ];

  // Replit routes the API artifact on :8080; local dev uses :5001.
  const apiTarget =
    process.env.API_PROXY_TARGET ??
    env.API_PROXY_TARGET ??
    (process.env.REPL_ID ? "http://127.0.0.1:8080" : "http://127.0.0.1:5001");

  return {
    base: basePath,
    envDir: workspaceRoot,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
