import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: "/cql-lforms-proposal/",
    // mode === "development"https://cfu288.github.io/cql-lforms-proposal/
    //   ? "http://localhost:5173/"
    //   :
  };
});
