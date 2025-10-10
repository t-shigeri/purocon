// src/pages/RequestPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RequestPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("お客様要望:", { name, message }); // 今はログ出力だけ
    setSubmitted(true);
    setName("");
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) throw new Error("送信に失敗しました");

      console.log("お客様要望:", { name, message });
      setSubmitted(true);
      setName("");
      setMessage("");
    } catch (error) {
      alert("送信エラー: " + error.message);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
        <h3>ご意見ありがとうございます！</h3>
        <p>お客様の貴重なご要望を受け取りました。</p>
        <button onClick={() => setSubmitted(false)}>もう一度送る</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>お客様のご要望</h2>
      <p>サービス向上のため、ぜひご意見をお聞かせください。</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>お名前（任意）</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>ご要望内容</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{
              width: "100%",
              height: 100,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "#b04747",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          送信
        </button>
      </form>
      {/* 戻るボタン */}
      <button
        onClick={handleBack}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          borderRadius: 8,
          background: "#f1d4d9",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        トップページへ戻る
      </button>
    </div>
  );
}
