import { useState } from "react";
import axios from "axios";

function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // 1. 新規登録
      const res = await axios.post("http://localhost:5000/register", {
        username,
        password
      });
      alert("新規登録成功！");

      // 2. 登録後に自動ログイン
      const loginRes = await axios.post("http://localhost:5000/login", {
        username,
        password
      });

      // JWT を保存してユーザー情報をセット
      localStorage.setItem("token", loginRes.data.token);
      setUser(loginRes.data.user);
    } catch (err) {
      alert(err.response?.data?.message || "登録失敗");
    }
  };

  return (
    <div>
      <h2>新規登録</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleRegister}>登録</button>
    </div>
  );
}

export default Register;
