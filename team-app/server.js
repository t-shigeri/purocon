import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();  // ← ここで app を定義
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL 接続設定
const db = mysql.createConnection({
  host: "localhost",
  user: "root",             // ← rootユーザー
  password: "Kita0310san",
  database: "myapp"
});

// 接続確認
db.connect(err => {
  if (err) {
    console.error("DB接続失敗:", err);
    return;
  }
  console.log("MySQLに接続成功！");
});

// ユーザー一覧API
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ログインAPI ← app 定義の後に置く！
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      if (results.length > 0) {
        res.json({ message: "ログイン成功", user: results[0] });
      } else {
        res.status(401).json({ message: "ユーザー名またはパスワードが間違っています" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`サーバー起動 http://localhost:${port}`);
});
