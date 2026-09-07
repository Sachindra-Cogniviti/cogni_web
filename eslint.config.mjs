import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Static export on shared hosting: no Node runtime on the server.
    // Fail fast on imports that only work with a Next server.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/headers",
              message:
                "No server runtime on Bluehost. cookies()/headers() cannot work in a static export.",
            },
            {
              name: "next/server",
              message:
                "No API routes, middleware or proxy on Bluehost. Put server-side work in a standalone .php file next to the static output.",
            },
            {
              name: "next/cache",
              message: "No ISR/revalidation on Bluehost. The site is fully static.",
            },
            {
              name: "server-only",
              message: "No server runtime on Bluehost. Everything is rendered at build time.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
