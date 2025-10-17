// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginForm from "./components/LoginForm";
import AdminPage from "./admin/AdminPage";
import ProductsList from "./admin/ProductsList";
import Diagnoses from "./admin/Diagnoses";
import Settings from "./admin/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "admin/products",
    element: <ProductsList />,
  },
  {
    path: "admin/diagnoses",
    element: <Diagnoses />,
  },
  {
    path: "admin/settings",
    element: <Settings />,
  },
]);

export default router;
