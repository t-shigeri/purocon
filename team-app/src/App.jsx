// src/App.jsx 置き換え
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// —— ここでバックエンドのエンドポイントを切り替え ——
// 以前のあなたのAPI: http://localhost:5000/login /profile なら↓のoldを使う
const PATHS = {
  // 新しいサンプルAPI（server.jsで用意した想定）
  login:   `${API}/api/auth/login`,
  me:      `${API}/api/auth/me`,
  // 以前のあなたのAPI（5000番ポート）を使うなら↓を有効化して上の3行はコメントアウト
  // login: "http://localhost:5000/login",
  // me:    "http://localhost:5000/profile",
};

// 3分操作がなければ自動でホーム(お客様画面)に戻す
const INACTIVITY_MS = 3 * 60 * 1000;

export default function App() {
  const [user, setUser] = useState(null);        // 店員のログイン状態
  const [username, setUsername] = useState("");  // 店員ログインID（or メール）
  const [password, setPassword] = useState("");  // 店員パスワード
  const [staffMode, setStaffMode] = useState(false); // 店員UI表示フラグ（隠し導線）
  const [msg, setMsg] = useState("");
  const taps = useRef(0);
  const timer = useRef(null);

  // 起動時：トークンがあれば店員情報を取得
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(PATHS.me, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        // server.js想定 { id, email, display_name } / 5000系なら { user: { ... } }
        const u = res.data.user || res.data;
        setUser(u);
        setStaffMode(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  // キオスク用：操作がなければ自動で客向けホームに戻す
  useEffect(() => {
    const resetTimer = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        // 店員がログインしていても画面だけはお客様ホームに戻す
        setStaffMode(false);
      }, INACTIVITY_MS);
    };
    const events = ["click", "keydown", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // 隠し導線1：ロゴを5回タップで店員UIトグル
  const onLogoTap = () => {
    taps.current += 1;
    if (taps.current >= 5) {
      setStaffMode((v) => !v);
      taps.current = 0;
    }
    setTimeout(() => (taps.current = 0), 1200);
  };

  // 隠し導線2：Alt+L で店員UIトグル
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === "l" || e.key === "L")) {
        setStaffMode((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogin = async () => {
    try {
      setMsg("");
      // server.js想定：{ token, user: {...} } / 5000版も同じ形にしておくと楽
      const res = await axios.post(PATHS.login, { email: username, username, password });
      const token = res.data.token;
      const u = res.data.user || { username }; // 最低限の表示
      if (!token) throw new Error("トークンが取得できませんでした");
      localStorage.setItem("token", token);
      setUser(u);
      setUsername("");
      setPassword("");
      setStaffMode(true);
    } catch (err) {
      setMsg(err.response?.data?.message || "ログインに失敗しました");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setStaffMode(false);
  };

  // ————— ここからUI —————

  // お客様向けホーム（広告＋カタログの簡易版。必要に応じて前回お渡しのUIに差し替えOK）
  const CustomerHome = () => (
    <div style={{ maxWidth: 480, margin: "24px auto", padding: 16 }}>
      <div
        onClick={onLogoTap}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        <div style={{ width: 28, height: 28, background: "#b04747", borderRadius: 6 }} />
        <strong>PUROCON COSME</strong>
      </div>

      {/* カルーセルのプレースホルダ（後で入替OK） */}
      <div style={{ borderRadius: 12, overflow: "hidden", background: "#e9e9ef", height: 160, marginBottom: 16, display: "grid", placeItems: "center" }}>
        <span>今週のおすすめ / キャンペーン</span>
      </div>

      {/* カテゴリ丸アイコン */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {["スキンケア", "メイク", "香水", "新商品"].map((c) => (
          <div
            key={c}
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#f1d4d9",
              display: "grid",
              placeItems: "center",
              fontSize: 12,
            }}
          >
            {c}
          </div>
        ))}
      </div>

      {/* カタログ（大きい写真＋名前＋価格＋キャッチ） */}
      <h3 style={{ margin: "8px 0" }}>商品カタログ</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[ // ダミー：本番はAPIの結果で
          { id: 1, title: "モイストローション", price: 2800, catch: "潤い続く化粧水" },
          { id: 2, title: "ルージュグロウ", price: 3200, catch: "鮮やかな発色" },
        ].map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ height: 110, background: "#e3e6ea" }} />
            <div style={{ padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong>{p.title}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{p.catch}</div>
              <div style={{ color: "#a55723", fontWeight: 700, marginTop: 6 }}>¥{p.price.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 店舗情報 */}
      <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 14, color: "#555" }}>
        <strong>店舗情報</strong>
        <div>福岡市中央区○○ 1-2-3 / 10:00-20:00</div>
        <div>今月のキャンペーン：スキンケア 20%OFF</div>
      </div>
    </div>
  );

  // 店員専用ログインUI（登録ボタンは無し）
  const StaffLogin = () => (
    <div style={{ maxWidth: 380, margin: "40px auto", padding: 20, border: "1px solid #ccc", borderRadius: 12 }}>
      <h3>店員ログイン</h3>
      {msg && (
        <div style={{ margin: "8px 0 12px", padding: 10, background: "#ffe9e9", border: "1px solid #f5bcbc", borderRadius: 8 }}>
          {msg}
        </div>
      )}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="ユーザー名 / メール"
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
      />
      <button onClick={handleLogin} style={{ width: "100%", padding: 10 }}>ログイン</button>
      <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>※ 登録は管理者のみ。お客様はご利用になれません。</div>
    </div>
  );

  // 店員プロフィール/簡易メニュー
  const StaffPanel = () => (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20, border: "1px solid #ccc", borderRadius: 12 }}>
      <h3>管理メニュー</h3>
      <div style={{ marginBottom: 12 }}>ようこそ、{user?.display_name || user?.email || user?.username} さん</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={{ padding: 10, flex: "1 1 48%" }}>在庫チェック</button>
        <button style={{ padding: 10, flex: "1 1 48%" }}>広告切替</button>
        <button style={{ padding: 10, flex: "1 1 48%" }}>ランキング編集</button>
        <button style={{ padding: 10, flex: "1 1 48%" }}>多言語テキスト</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => setStaffMode(false)} style={{ flex: 1 }}>お客様画面へ</button>
        <button onClick={handleLogout} style={{ flex: 1, background: "#333", color: "#fff" }}>ログアウト</button>
      </div>
    </div>
  );

  // 画面分岐
  if (!staffMode) return <CustomerHome />;
  if (staffMode && !user) return <StaffLogin />;
  return <StaffPanel />;
}
