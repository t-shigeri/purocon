// SkinTypeDiagnosis.jsx
import { useState } from "react";

const questions = [
  { id: 1, text: "洗顔後、肌がつっぱる感じはありますか？", options: [{ text: "はい", nextQuestionId: 2 }, { text: "いいえ", nextQuestionId: 3 }] },
  { id: 2, text: "頬や口元がカサつきやすいですか？", options: [{ text: "はい", nextQuestionId: 4 }, { text: "いいえ", nextQuestionId: 4 }] },
  { id: 3, text: "Tゾーン（額・鼻）がテカりやすいですか？", options: [{ text: "はい", nextQuestionId: 5 }, { text: "いいえ", nextQuestionId: 5 }] },
  { id: 4, text: "肌に赤みやかゆみが出ることがありますか？", options: [{ text: "はい", nextQuestionId: 6 }, { text: "いいえ", nextQuestionId: 6 }] },
  { id: 5, text: "季節の変わり目に肌トラブルが起きやすいですか？", options: [{ text: "はい", nextQuestionId: 6 }, { text: "いいえ", nextQuestionId: 6 }] },
  { id: 6, text: "肌の状態が日によって大きく変わると感じますか？", options: [{ text: "はい", nextQuestionId: 7 }, { text: "いいえ", nextQuestionId: 7 }] },
  { id: 7, text: "メイクやスキンケアで刺激を感じることがありますか？", options: [{ text: "はい", nextQuestionId: 8 }, { text: "いいえ", nextQuestionId: 8 }] },
  { id: 8, text: "日中、肌の乾燥とテカリの両方が気になりますか？", options: [{ text: "はい", nextQuestionId: 9 }, { text: "いいえ", nextQuestionId: 9 }] },
  { id: 9, text: "肌質について自分で把握できていると思いますか？", options: [{ text: "はい", nextQuestionId: 10 }, { text: "いいえ", nextQuestionId: 10 }] },
  {
    id: 10,
    text: "以下の中で一番当てはまる肌の状態は？",
    options: [
      { text: "洗顔後に乾燥しやすく、カサつきが気になる", nextQuestionId: null, result: "あなたの肌質は【乾燥肌】です。" },
      { text: "Tゾーンがテカりやすく、毛穴が気になる", nextQuestionId: null, result: "あなたの肌質は【脂性肌】です。" },
      { text: "部分的に乾燥とテカリが混在している", nextQuestionId: null, result: "あなたの肌質は【混合肌】です。" },
      { text: "刺激に弱く、赤みやかゆみが出やすい", nextQuestionId: null, result: "あなたの肌質は【敏感肌】です。" }
    ]
  }
];

export default function SkinTypeDiagnosis() {
  const [currentId, setCurrentId] = useState(1);
  const [result, setResult] = useState(null);

  const currentQuestion = questions.find(q => q.id === currentId);

  const handleAnswer = (option) => {
    if (option.nextQuestionId === null) {
      setResult(option.result);
    } else {
      setCurrentId(option.nextQuestionId);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {!result ? (
        <>
          <h2>{currentQuestion.text}</h2>
          <div style={{ marginTop: '1rem' }}>
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(option)}>
                {option.text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <h2>診断結果</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}