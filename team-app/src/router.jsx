// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginForm from "./components/LoginForm";
import AdminPage from "./admin/AdminPage";
import ProductsList from "./admin/ProductsList";
import Diagnoses from "./admin/Diagnoses";
import Settings from "./admin/Settings";
import ProtectedRoute from "./components/ProtectedRouter";
import Contactspage from "./contacts/Contactspage";
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
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/contacts",
    element: < Contactspage/>,
  },
]);

export default router;
