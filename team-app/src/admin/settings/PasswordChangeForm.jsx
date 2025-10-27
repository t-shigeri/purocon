import React, { useState } from "react";
// import api from "../api/withToken.js"; // 実際のAPIクライアント

// --- スタイル定義 ---
// スタイルをオブジェクトとしてまとめておくと、JSX内がすっきりします。
const styles = {
  // フォーム全体を囲うコンテナ
  formContainer: {
    maxWidth: "450px",
    margin: "40px auto",
    padding: "24px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    fontFamily: "sans-serif", // 可독性を上げるため
  },
  // フォームのタイトル
  title: {
    textAlign: "center",
    margin: "0 0 20px 0",
    color: "#333",
  },
  // ラベルと入力欄のセット
  formGroup: {
    marginBottom: "16px",
  },
  // ラベル
  label: {
    display: "block", // 入力欄の上に表示
    marginBottom: "8px",
    fontWeight: "600",
    color: "#555",
  },
  // 入力欄
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box", // paddingを含めてwidth: 100%にする
    fontSize: "16px",
  },
  // 送信ボタン
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "8px",
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
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  // エラーメッセージ
  errorMessage: {
    backgroundColor: "#f8d7da",
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
      // --- テスト用のダミー処理 ---
      // 実際には api.put を使います
      await new Promise((resolve) => setTimeout(resolve, 500));
      // if (formData.old_password !== "123") { // テスト用エラー
      //   throw new Error("現在のパスワードが違います。");
      // }
      // await api.put("/auth/password/change/", formData);
      // --- テスト用ここまで ---

      setMessage({ type: "success", text: "パスワードが変更されました。" });
      setFormData({ old_password: "", new_password1: "", new_password2: "" });
    } catch (err) {
      // APIエラー、またはテスト用のErrorオブジェクトからメッセージを取得
      const errorText =
        err.response?.data?.detail || err.message || "エラーが発生しました。";
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
