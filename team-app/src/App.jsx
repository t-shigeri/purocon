import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://localhost:5000/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "ログイン失敗");
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/register", {
        username,
        password
      });
      // 登録後自動ログイン
      const loginRes = await axios.post("http://localhost:5000/login", {
        username,
        password
      });
      localStorage.setItem("token", loginRes.data.token);
      setUser(loginRes.data.user);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "登録失敗");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      {user ? (
        <div>
          <h2>{user.username} さん、ようこそ！</h2>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      ) : (
        <div>
          <h2>{isRegister ? "新規登録" : "ログイン"}</h2>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />
          <button
            onClick={isRegister ? handleRegister : handleLogin}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          >
            {isRegister ? "登録" : "ログイン"}
          </button>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => setIsRegister(!isRegister)} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
              {isRegister ? "ログイン画面に戻る" : "新規登録はこちら"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
