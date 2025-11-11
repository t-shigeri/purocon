import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginForm from "./login/LoginForm";
import AdminPage from "./admin/AdminPage";
import ProductsList from "./admin/Product/ProductsList.jsx";
import Diagnoses from "./admin/Diagnoses/Diagnoses";
import Settings from "./admin/settings/Settings";
import ProtectedRoute from "./login/ProtectedRouter";
import Contactspage from "./contacts/Contactspage";
import SkinTypeChecker from "./question/SkinTypeChecker";

// screendesign ブランチからの import
import Weekrecommend from "./about/Weekrecommend.jsx";
// main ブランチからの import
import Ingredient from "./admin/Ingredient/Ingredient.jsx";
import PasswordChangeForm from "./admin/settings/PasswordChangeForm";
const router = createBrowserRouter([
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
        element: <ProductsList />,
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
      {
        path: "ProductsList",
        element: <ProductsList />,
      },
    ],
  },
  {
    path: "/contacts",
    element: <Contactspage />,
  },
  {
    path: "/Question",
    element: <SkinTypeChecker />,
  },
]);

export default router;
