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
import SkinTypeChecker from "./question/SkinTypeChecker";
import Weekrecommend from "./about/Weekrecommend.jsx"; const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    // これは今週のおすすめ商品のpath
    path: "/weekrecommend",
    element: <Weekrecommend />,
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
        element: <ProductsList/>,
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
  {path: "/Question",
    element: < SkinTypeChecker/>
  }
]);

export default router;
