import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same "@/..." alias as tsconfig.json, so tests import code the same way the app does.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // server-only throws outside Next.js's server build; tests run on the
      // server side anyway.
      "server-only": fileURLToPath(
        new URL(
          "./node_modules/next/dist/compiled/server-only/empty.js",
          import.meta.url,
        ),
      ),
    },
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    passWithNoTests: true,
  },
});
