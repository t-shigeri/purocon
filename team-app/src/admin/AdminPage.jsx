import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>管理者メニュー</h1>
      <p style={styles.subtitle}>管理したい項目を選択してください</p>

      <div style={styles.menuContainer}>
        <Link to="/admin/products" style={styles.card}>
          <h2>商品管理</h2>
          <p>店舗にある美容液の登録・編集・削除を行います。</p>
        </Link>

        <Link to="/admin/diagnoses" style={styles.card}>
          <h2>診断結果管理</h2>
          <p>お客様の診断履歴やおすすめ傾向を確認できます。</p>
        </Link>

        <Link to="/admin/settings" style={styles.card}>
          <h2>設定</h2>
          <p>管理者アカウントやシステム設定を変更します。</p>
        </Link>
      </div>
    </div>
  );
}
const styles = {
  container: {
    padding: "40px",
    fontFamily: "sans-serif",
    textAlign: "center",
    backgroundColor: "#f7f8fa",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2.2rem",
    color: "#333",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    marginBottom: "40px",
  },
  menuContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "30px",
  },
  card: {
    width: "260px",
    textDecoration: "none",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    color: "#333",
  },
};
