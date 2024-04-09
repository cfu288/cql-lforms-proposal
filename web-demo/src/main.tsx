import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ExpressionDemo from "./ExpressionDemo.tsx";
import LibraryDemo from "./LibraryDemo.tsx";
import "./index.css";

const base = import.meta.env.DEV ? "/" : "/cql-lforms-proposal/";
const router = createBrowserRouter([
  {
    path: base,
    element: <ExpressionDemo />,
  },
  {
    path: base + "libraries",
    element: <LibraryDemo />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
