import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./app";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import ApplyStart from "./pages/ApplyStart";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppLayout>
        <App />
      </AppLayout>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "apply", element: <ApplyStart /> },
      { path: "*", element: <NotFound /> }
    ],
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
