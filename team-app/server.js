import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const secretKey = "your_secret_key"; // JWTの署名キー

// MySQL接続
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kita0310san",
  database: "myapp"
});

// 新規登録
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.execute("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
  res.json({ message: "新規登録成功", userId: result.insertId });
});

// ログイン
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.execute("SELECT * FROM users WHERE username=?", [username]);

  if (rows.length === 0) return res.status(400).json({ message: "ユーザーが存在しません" });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "パスワードが違います" });

  const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "1h" });
  res.json({ message: "ログイン成功", user: { id: user.id, username: user.username }, token });
});

// プロフィール取得（自動ログイン用）
app.get("/profile", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "トークンが必要です" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, secretKey);
    const [rows] = await db.execute("SELECT id, username FROM users WHERE id=?", [payload.id]);
    if (rows.length === 0) return res.status(404).json({ message: "ユーザーが見つかりません" });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(401).json({ message: "無効なトークンです" });
  }
});

// サーバー起動
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
