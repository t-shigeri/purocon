import { useState } from "react";
import axios from "axios";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password
      });
      // JWT を localStorage に保存
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      alert("ログイン成功！");
    } catch (err) {
      alert(err.response?.data?.message || "ログイン失敗");
    }
  };

  return (
    <div>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"/>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
}

export default Login;
