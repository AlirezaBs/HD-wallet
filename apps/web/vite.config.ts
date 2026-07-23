import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hd-wallet/core": path.resolve(
        __dirname,
        "../../packages/core/src/index.ts",
      ),
      "@hd-wallet/core-worker-service": path.resolve(
        __dirname,
        "../../packages/core/src/crypto/worker-service.ts",
      ),
      "@hd-wallet/stores": path.resolve(
        __dirname,
        "../../packages/stores/src/index.ts",
      ),
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["hash-wasm"],
  },
});
