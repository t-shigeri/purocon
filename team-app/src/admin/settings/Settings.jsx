import { Link } from "react-router-dom";
import "../AdminPage.css";
import Logout from "../../components/logout";

export default function AdminHome() {
  return (
    <div style={styles.container}>
      <div className="logout-button-container">
        <Logout />
      </div>

      <h1 style={styles.title}>管理者設定画面</h1>
      <p style={styles.subtitle}>管理したい項目を選択してください</p>

      <div style={styles.menuContainer}>
        <Link to="../PasswordChangeForm" style={styles.card}>
          <h2>パスワード変更</h2>
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
