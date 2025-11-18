import { useEffect, useRef } from "react";
import Weekrecommend from "./about/Weekrecommend.jsx";
import { Link, useNavigate } from "react-router-dom";

import "./App.css";
import SkinTypeChecker from "./question/SkinTypeChecker.jsx";

export default function App() {
  const navigate = useNavigate();
  const taps = useRef(0);

  // ロゴ5回タップで /login へ遷移
  const onLogoTap = () => {
    taps.current += 1;
    if (taps.current >= 5) {
      navigate("/login");
      taps.current = 0;
    }
    setTimeout(() => (taps.current = 0), 1200);
  };

  // Alt+L で /login へ遷移
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === "l" || e.key === "L")) {
        navigate("/login");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="app-container">
      {/* ロゴバー */}
      <div onClick={onLogoTap} className="logo-bar">
        <div className="logo-icon" />
        <strong>PUROCON COSME</strong>
      </div>

      {/* メインコンテンツエリア */}
      <div className="recommend-container">
        <div className="recommend-inner">
          <SkinTypeChecker />
        </div>

        <Link
          to="/Question"
          className="recommend-link"
          aria-label="今週のおすすめページへ"
        >
          {/* 画像エリア */}
          <img
            src="/assets/今週のおすすめ商品 ＆ キャンペーン！！.png"
            alt="今週のおすすめ"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Link>
      </div>

      {/* カテゴリーバー */}
      <div className="category-bar">
        {["スキンケア", "メイク", "香水", "新商品"].map((c) => (
          <div key={c} className="category-item">
            {c}
          </div>
        ))}
      </div>

      <h3 className="catalog-title">商品カタログ</h3>

      {/* 商品リスト */}
      <div className="catalog-grid">
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
          <div key={p.id} className="product-card">
            <div className="product-image-placeholder" />
            <div className="product-info">
              <div className="product-header">
                <strong>{p.title}</strong>
              </div>
              <div className="product-catch"> {p.catch}</div>
              <div className="product-price"> ¥{p.price.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 店舗情報 */}
      <div className="store-info">
        <strong>店舗情報</strong>
        <div>福岡市中央区○○ 1-2-3 / 10:00-20:00</div>
        <div>今月のキャンペーン：スキンケア 20%OFF</div>
      </div>
    </div>
  );
}
