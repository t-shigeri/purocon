import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate(); // ← ここを追加

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "ログイン失敗。メールアドレスまたはパスワードを確認してください。"
        );
      }

      const data = await response.json();

      // JWTなどトークンを保存（SimpleJWT想定）
      if (data.access) {
        localStorage.setItem("accessToken", data.access);
      }

      setMsg("ログイン成功！");
      navigate("/admin"); // ← ログイン成功時に /admin へ移動
    } catch (error) {
      setMsg(error.message || "ログイン中にエラーが発生しました。");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>スタッフログイン</h2>

        <label>メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">ログイン</button>

        {msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
}
