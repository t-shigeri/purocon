import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./App.css";
import SkinTypeChecker from "./question/SkinTypeChecker.jsx";

export default function App() {
  const navigate = useNavigate();
  const taps = useRef(0);
  const [showQuiz, setShowQuiz] = useState(false);

  // ロゴ5回タップで /login へ遷移
  const onLogoTap = () => {
    taps.current += 1;
    if (taps.current >= 5) {
      navigate("/login");
      taps.current = 0;
    }
    setTimeout(() => (taps.current = 0), 1200);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === "l" || e.key === "L")) {
        navigate("/login");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    // 診断エリアが表示されたら、少し遅延してスクロール
    setTimeout(() => {
      document.getElementById("quiz-section")?.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  return (
    <div className="app-root">
      <div className="device-frame">
        {/* ヒーローセクション */}
        <div className="hero">
          <header className="hero-header">
            <div className="hero-logo" onClick={onLogoTap}>
              <div className="hero-logo-icon" />
              <span className="hero-logo-text">Radiance Labs</span>
            </div>
            <div className="hero-lang">日本語 / English</div>
          </header>

          <div className="hero-body">
            {/* テキストエリア */}
            <div className="hero-copy">
              <h1 className="hero-title">Unlock Your Skin&apos;s Potential</h1>
              <p className="hero-sub">
                パーソナライズ肌質診断 &amp; セラムガイド
              </p>

              <div className="hero-buttons">
                <button className="btn-primary" onClick={handleStartQuiz}>
                  肌質診断をはじめる(無料)
                </button>
                <button className="btn-secondary">
                  セラム・商品一覧を見る
                </button>
              </div>
            </div>

            {/* 画像エリア */}
            <div className="hero-visual">
              {/* 好きな画像に差し替えてOK */}
              <img
                src="/assets/hero_model.png"
                alt="スキンケア女性イメージ"
                className="hero-image"
              />
            </div>
          </div>
        </div>

        {/* 診断エリア:ボタン押したら表示 */}
        {showQuiz && (
          <div id="quiz-section" className="quiz-section">
            <SkinTypeChecker />
          </div>
        )}
      </div>
    </div>
  );
}