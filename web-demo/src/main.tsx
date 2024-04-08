import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ExpressoinDemo from "./ExpressionDemo.tsx";
import LibraryDemo from "./LibraryDemo.tsx";
import "./index.css";
import { NavBar } from "./NavBar.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ExpressoinDemo />,
  },
  {
    path: "/libraries",
    element: <LibraryDemo />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NavBar />
    <RouterProvider router={router} />
  </React.StrictMode>
);
