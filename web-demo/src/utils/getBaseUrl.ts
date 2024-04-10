export function getBaseUrl() {
  return import.meta.env.DEV
    ? "http://localhost:5173/"
    : "https://cfu288.github.io/cql-lforms-proposal/";
}
