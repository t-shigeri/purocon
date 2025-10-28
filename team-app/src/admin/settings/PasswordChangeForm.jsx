import React, { useState } from "react";
import api from "../../api/withToken.js"; // 修正済みのパス

// --- スタイル定義 ---
// スタイルをオブジェクトとしてまとめておくと、JSX内がすっきりします。
const styles = {
  // フォーム全体を囲うコンテナ
  formContainer: {
    maxWidth: "450px", // フォームの最大幅
    margin: "40px auto", // 上下左右の余白（中央寄せ）
    padding: "24px", // 内側の余白
    border: "1px solid #e0e0e0", // 枠線
    borderRadius: "8px", // 角丸
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", // 影
    fontFamily: "sans-serif", // フォント
  },
  // フォームのタイトル
  title: {
    textAlign: "center",
    margin: "0 0 20px 0", // タイトルの下の余白
    color: "#333",
  },
  // ラベルと入力欄のセット
  formGroup: {
    marginBottom: "16px", // 各項目の下の余白
  },
  // ラベル
  label: {
    display: "block", // 入力欄の上に表示
    marginBottom: "8px", // ラベルと入力欄の間の余白
    fontWeight: "600", // 少し太字に
    color: "#555",
  },
  // 入力欄
  input: {
    width: "100%", // 親要素いっぱいに広げる
    padding: "10px 12px", // 入力欄の内側の余白
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box", // paddingを含めてwidth: 100%にする
    fontSize: "16px",
  },
  // 送信ボタン
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff", // ボタンの色
    color: "white", // 文字色
    border: "none",
    borderRadius: "4px",
    cursor: "pointer", // マウスカーソルを指マークに
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "8px", // 最後の項目との間に余白
  },
  // メッセージの基本スタイル
  message: {
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "4px",
    fontSize: "14px",
    textAlign: "center",
  },
  // 成功メッセージ
  successMessage: {
    backgroundColor: "#d4edda", // 緑系の背景
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  // エラーメッセージ
  errorMessage: {
    backgroundColor: "#f8d7da", // 赤系の背景
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
};
// --- スタイル定義ここまで ---

function PasswordChangeForm() {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password1: "",
    new_password2: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.new_password1 !== formData.new_password2) {
      setMessage({ type: "error", text: "新しいパスワードが一致しません。" });
      return;
    }

    try {
      // DRFの /api/auth/password/change/ エンドポイントに PUT
      await api.put("/auth/password/change/", formData);
      setMessage({ type: "success", text: "パスワードが変更されました。" });
      setFormData({ old_password: "", new_password1: "", new_password2: "" });
    } catch (err) {
      // DRFからのバリデーションエラーを取得
      const errorText = err.response?.data?.detail || "エラーが発生しました。";
      setMessage({ type: "error", text: errorText });
    }
  };

  // メッセージのスタイルを動的に決定
  const messageStyle = {
    ...styles.message,
    ...(message.type === "success" ? styles.successMessage : {}),
    ...(message.type === "error" ? styles.errorMessage : {}),
  };

  return (
    // スタイルを適用したコンテナでフォームを囲う
    <div style={styles.formContainer}>
      <form onSubmit={handleSubmit}>
        <h3 style={styles.title}>パスワード変更</h3>

        {/* メッセージ表示エリア */}
        {message.text && <p style={messageStyle}>{message.text}</p>}

        {/* --- フォームグループ1 --- */}
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="old_password">
            現在のパスワード:
          </label>
          <input
            style={styles.input}
            type="password"
            id="old_password" // labelのhtmlForと紐付け
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            required
          />
        </div>

        {/* --- フォームグループ2 --- */}
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="new_password1">
            新しいパスワード:
          </label>
          <input
            style={styles.input}
            type="password"
            id="new_password1" // labelのhtmlForと紐付け
            name="new_password1"
            value={formData.new_password1}
            onChange={handleChange}
            required
          />
        </div>

        {/* --- フォームグループ3 --- */}
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="new_password2">
            新しいパスワード (確認):
          </label>
          <input
            style={styles.input}
            type="password"
            id="new_password2" // labelのhtmlForと紐付け
            name="new_password2"
            value={formData.new_password2}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          変更
        </button>
      </form>
    </div>
  );
}

export default PasswordChangeForm;
