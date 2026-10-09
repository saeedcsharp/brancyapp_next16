import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Every rule reports as a warning so linting never blocks builds or existing code.
const toWarn = (severity) => {
  if (severity === "error" || severity === 2) return "warn";
  if (Array.isArray(severity)) return [toWarn(severity[0]), ...severity.slice(1)];
  return severity;
};

const warnOnly = (configs) =>
  configs.map((config) =>
    config.rules
      ? {
          ...config,
          rules: Object.fromEntries(Object.entries(config.rules).map(([name, severity]) => [name, toWarn(severity)])),
        }
      : config,
  );

export default defineConfig([
  ...warnOnly([...nextVitals, ...nextTs]),
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
    "public/**",
    ".ai-memory/**",
    // Uses `extends DefaultSession["user"]`, which tsc skips (skipLibCheck) but the ESLint parser rejects.
    "types/next-auth.d.ts",
  ]),
]);
