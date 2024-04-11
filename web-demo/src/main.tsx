import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ExpressionDemo from "./pages/ExpressionDemo.tsx";
import QuestionnaireLibraryDemo from "./pages/QuestionnaireLibraryDemo.tsx";
import { Home } from "./pages/Home.tsx";
import { AppRoutes } from "./Routes.tsx";
import QuestionnaireExpressionDemo from "./pages/QuestionnaireExpressionDemo.tsx";

const router = createBrowserRouter([
  {
    path: AppRoutes.home,
    element: <Home />,
  },
  {
    path: AppRoutes.expressions,
    element: <ExpressionDemo />,
  },
  {
    path: AppRoutes.questionnaireInlineExpressions,
    element: <QuestionnaireExpressionDemo />,
  },
  {
    path: AppRoutes.questionnaireLibraries,
    element: <QuestionnaireLibraryDemo />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
