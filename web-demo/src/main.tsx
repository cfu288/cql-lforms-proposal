import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ExpressionDemo from "./ExpressionDemo.tsx";
import QuestionnaireLibraryDemo from "./QuestionnaireLibraryDemo.tsx";
import { Home } from "./Home.tsx";
import { AppRoutes } from "./Routes.tsx";
import QuestionnaireExpressionDemo from "./QuestionnaireExpressionDemo.tsx";

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
