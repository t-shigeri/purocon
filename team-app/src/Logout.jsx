function Logout({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem("token"); // JWT を削除
    onLogout(); // 上位コンポーネントに状態変更を通知
  };

  return <button onClick={handleLogout}>ログアウト</button>;
}

export default Logout;
