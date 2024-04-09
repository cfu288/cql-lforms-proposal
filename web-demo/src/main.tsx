import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ExpressionDemo from "./ExpressionDemo.tsx";
import LibraryDemo from "./LibraryDemo.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ExpressionDemo />,
  },
  {
    path: "/libraries",
    element: <LibraryDemo />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
