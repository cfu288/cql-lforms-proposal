import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base:
      mode === "development"
        ? undefined
        : "https://cfu288.github.io/cql-lforms-proposal/",
  };
});
