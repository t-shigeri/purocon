// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginForm from "./components/LoginForm";
import AdminPage from "./admin/AdminPage";
import ProductsList from "./admin/ProductsList";
import Diagnoses from "./admin/Diagnoses";
import Settings from "./admin/settings/Settings";
import ProtectedRoute from "./components/ProtectedRouter";
import Contactspage from "./contacts/Contactspage";
import SkinTypeChecker from "./question/SkinTypeChecker";
import Ingredient from "./admin/Ingredient";
import PasswordChangeForm from "./admin/settings/PasswordChangeForm";

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
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
      {
        path: "products",
        element: <ProtectedRoute />,
      },
      {
        path: "diagnoses",
        element: <Diagnoses />,
      },
      {
        path: "settings/settings",
        element: <Settings />,
      },
      {
        path: "ingredient",
        element: <Ingredient />,
      },
      {
        path: "passwordchangeform",
        element: <PasswordChangeForm />,
      },
    ],
  },
  {
    path: "/contacts",
    element: <Contactspage />,
  },
  { path: "/Question", element: <SkinTypeChecker /> },
]);

export default router;
