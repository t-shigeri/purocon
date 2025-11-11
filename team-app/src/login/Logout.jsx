import React from "react";
// (react-router-dom を使っている場合)
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  // ログアウト処理を実行する関数
  const handleLogout = () => {
    // 1. ユーザーに確認する (任意)
    if (window.confirm("ログアウトしますか？")) {
      // 2. localStorage から 'authToken' を削除
      // (リフレッシュトークンなどもある場合は、それも削除します)
      localStorage.removeItem("accessToken");
      // localStorage.removeItem('refreshToken');

      // (もし localStorage.clear() を使う場合)
      // localStorage.clear();

      // 3. ログインページへリダイレクト
      // (必要に応じて、認証状態の state などもリセットします)
      navigate("/login");
    }
  };

  return <button onClick={handleLogout}>ログアウト</button>;
}

export default Logout;
