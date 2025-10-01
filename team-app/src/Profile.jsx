import Logout from "./Logout";

function Profile({ user, setUser }) {
  if (!user) return <p>ログインしていません</p>;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div>
      <p>ようこそ {user.username} さん</p>
      <Logout onLogout={handleLogout} />
    </div>
  );
}

export default Profile;
