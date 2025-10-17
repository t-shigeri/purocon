// src/components/ProtectedRoute.js (修正版)

// ★ Outlet を react-router-dom からインポートします
import { Navigate, Outlet } from "react-router-dom";

// 認証チェックロジックは同じ
const checkAuth = () => {
  const token = localStorage.getItem("accessToken");
  return !!token;
};

const ProtectedRoute = () => {
  const isAuth = checkAuth();

  // 認証OKなら <Outlet /> (子ルートの表示場所) をレンダリング
  // NGなら /login へリダイレクト
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
