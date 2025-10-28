// import { useEffect, useState } from "react";

// export default function App() {
//   const [message, setMessage] = useState("");
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     fetch("/api/hello/")
//       .then((res) => {
//         if (!res.ok) throw new Error("APIエラー " + res.status);
//         return res.json();
//       })
//       .then((data) => {
//         setMessage(data.message);
//         setItems(data.items || []);
//       })
//       .catch((err) => {
//         console.error(err);
//         setMessage("API取得に失敗しました");
//       });
//   }, []);

//   return (
//     <div style={{ maxWidth: 560, margin: "32px auto", fontFamily: "system-ui" }}>
//       <h1></h1>
//       <p>あｄ {message}</p>
//       <h3></h3>
//       <ul>
//         {items.map((it) => (
//           <li key={it.id}>{it.title}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// src/App.jsx（DRF + SimpleJWT 版）
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import LoginForm from "./components/LoginForm";
import Weekrecommend from "./about/Weekrecommend.jsx";
import { Link } from "react-router-dom";



// Viteプロキシを使うなら BASE は空文字でOK（/api → 8000へ転送）
// 直叩き派は .env で VITE_API_BASE_URL=http://localhost:8000 のように指定
const BASE = import.meta.env.VITE_API_BASE_URL || "";

// DRF(SimpleJWT)の標準エンドポイント
const PATHS = {
  tokenObtain: `${BASE}/api/token/`,
  tokenRefresh: `${BASE}/api/token/refresh/`,
  me: `${BASE}/api/me/`, // ※DRF側で要実装（認証ユーザー情報を返す）
};

const INACTIVITY_MS = 3 * 60 * 1000;

// --- axios インスタンス（認証ヘッダと自動リフレッシュ） ---
const api = axios.create();

function getAccessToken() {
  return localStorage.getItem("access");
}
function getRefreshToken() {
  return localStorage.getItem("refresh");
}
function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}
function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

// リクエストにAuthorizationを付与
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401なら自動でリフレッシュ→再試行
let isRefreshing = false;
let pending = [];
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        return Promise.reject(err);
      }
      // 連続リフレッシュを防ぐキュー
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pending.push({ resolve, reject, original });
        });
      }
      isRefreshing = true;
      try {
        const r = await axios.post(PATHS.tokenRefresh, { refresh });
        setTokens({ access: r.data.access });
        isRefreshing = false;
        // 溜めたリクエストを再実行
        pending.forEach(({ resolve }) => resolve(api(original)));
        pending = [];
        return api(original);
      } catch (e) {
        isRefreshing = false;
        pending.forEach(({ reject }) => reject(e));
        pending = [];
        clearTokens();
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  }
);

export default function App() {
  const [user, setUser] = useState(null); // 店員ログイン状態
  const [username, setUsername] = useState(""); // Djangoのユーザー名（メールでもOK：設定次第）
  const [password, setPassword] = useState(""); // パスワード
  const [staffMode, setStaffMode] = useState(false); // 店員UIの表示/非表示
  const [msg, setMsg] = useState("");

  const taps = useRef(0);
  const timer = useRef(null);

  // 起動時：トークンがあれば /api/me/ で本人情報を取得
  useEffect(() => {
    const access = getAccessToken();
    if (!access) return;
    api
      .get(PATHS.me)
      .then((res) => {
        setUser(res.data); // 例: {id, username, email, ...}
        setStaffMode(true);
      })
      .catch(() => {
        clearTokens();
        setUser(null);
      });
  }, []);

  // 3分無操作でお客様画面へ戻す（ログアウトはしない）
  useEffect(() => {
    const resetTimer = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStaffMode(false), INACTIVITY_MS);
    };
    const events = ["click", "keydown", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // ロゴ5回タップで店員UIトグル
  const onLogoTap = () => {
    taps.current += 1;
    if (taps.current >= 5) {
      setStaffMode((v) => !v);
      taps.current = 0;
    }
    setTimeout(() => (taps.current = 0), 1200);
  };

  // Alt+L で店員UIトグル
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === "l" || e.key === "L")) {
        setStaffMode((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ログイン：/api/token/ に username/password
  const handleLogin = async () => {
    setMsg("");
    try {
      const r = await axios.post(PATHS.tokenObtain, {
        username,
        password,
      });
      // SimpleJWT: { access, refresh }
      if (!r.data?.access) throw new Error("トークンが取得できませんでした");
      setTokens({ access: r.data.access, refresh: r.data.refresh });

      // 自分情報取得
      const me = await api.get(PATHS.me);
      setUser(me.data);
      setUsername("");
      setPassword("");
      setStaffMode(true);
    } catch (err) {
      const m =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "ログインに失敗しました";
      setMsg(m);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setStaffMode(false);
  };

  // ====== UI ======

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
        <div
          style={{
            width: 28,
            height: 28,
            background: "#b04747",
            borderRadius: 6,
          }}
        />
        <strong>PUROCON COSME</strong>
      </div>

      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          background: "#e9e9ef",
          height: 160,
          marginBottom: 16,
          display: "grid",
        }}
      >
        {/* 中身をWeekrecommendに置換 */}
        <div style={{ padding: 16, overflow: "auto" }}>
          <Weekrecommend />
        </div>
        <Link
          to="/weekrecommend"
          style={{
            display: "block",
            borderRadius: 12,
            overflow: "hidden",
            background: "#e9e9ef",
            height: 160,
            marginBottom: 16,
            display: "grid",
            placeItems: "center",
            border: "1px solid #ddd",
            cursor: "pointer",
            textDecoration: "none",
            color: "inherit",
          }}
          aria-label="今週のおすすめページへ"
        >
          {/* 中身は自由に：テキストでも画像でもOK */}
          <span style={{ opacity: 0.75 }}>今週のおすすめ / キャンペーン</span>
          {/* もし中身をプレビューしたいなら ↓ を使ってもOK */}
          {/* <div style={{ padding: 16, width: "100%" }}><Weekrecommend /></div> */}
        </Link>


      </div>
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

      <h3 style={{ margin: "8px 0" }}>商品カタログ</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          {
            id: 1,
            title: "モイストローション",
            price: 2800,
            catch: "潤い続く化粧水",
          },
          {
            id: 2,
            title: "ルージュグロウ",
            price: 3200,
            catch: "鮮やかな発色",
          },
        ].map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div style={{ height: 110, background: "#e3e6ea" }} />
            <div style={{ padding: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <strong>{p.title}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {p.catch}
              </div>
              <div style={{ color: "#a55723", fontWeight: 700, marginTop: 6 }}>
                ¥{p.price.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: "1px solid #eee",
          fontSize: 14,
          color: "#555",
        }}
      >
        <strong>店舗情報</strong>
        <div>福岡市中央区○○ 1-2-3 / 10:00-20:00</div>
        <div>今月のキャンペーン：スキンケア 20%OFF</div>
      </div>
    </div>
  );

  const StaffLogin = () => (
    <div
      style={{
        maxWidth: 380,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 12,
      }}
    >
      <h3>店員ログイン</h3>
      {msg && (
        <div
          style={{
            margin: "8px 0 12px",
            padding: 10,
            background: "#ffe9e9",
            border: "1px solid #f5bcbc",
            borderRadius: 8,
          }}
        >
          {msg}
        </div>
      )}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="ユーザー名"
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
        autoComplete="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
        autoComplete="current-password"
      />
      <button onClick={handleLogin} style={{ width: "100%", padding: 10 }}>
        ログイン
      </button>
      <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
        ※ 登録は管理者のみ。お客様はご利用になれません。
      </div>
    </div>
  );

  const StaffPanel = () => (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 12,
      }}
    >
      <h3>管理メニュー</h3>
      <div style={{ marginBottom: 12 }}>
        ようこそ、{user?.display_name || user?.email || user?.username} さん
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={{ padding: 10, flex: "1 1 48%" }}>在庫チェック</button>
        <button style={{ padding: 10, flex: "1 1 48%" }}>広告切替</button>
        <button style={{ padding: 10, flex: "1 1 48%" }}>ランキング編集</button>
        <button style={{ padding: 10, flex: "1 1 48%" }}>多言語テキスト</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => setStaffMode(false)} style={{ flex: 1 }}>
          お客様画面へ
        </button>
        <button
          onClick={handleLogout}
          style={{ flex: 1, background: "#333", color: "#fff" }}
        >
          ログアウト
        </button>
      </div>
    </div>
  );

  if (!staffMode) return <CustomerHome />;
  if (staffMode && !user) return <StaffLogin />;
  return <StaffPanel />;
}
