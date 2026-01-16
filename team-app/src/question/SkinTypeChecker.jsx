'use client'
 
import React, { useState } from 'react';
 
export default function SkinTypeChecker() {
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const [recommends, setRecommends] = useState([]);
  const [selected1, setSelected1] = useState('');
  const [selected2, setSelected2] = useState('');
  const [selected3, setSelected3] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const question1 = {
    title: '以下のような肌の状態はありますか？',
    options: [
      '化粧水・クリームなど新しいスキンケアを使うと赤くなったり痒くなることがある',
      '季節・気温・生活習慣（睡眠不足・ストレス）で急に肌が荒れやすい',
      '汗やマスク・摩擦など、ちょっとした刺激でヒリつく',
      'ニキビではなく、赤み・ひりひり・かゆみ系のトラブルが出やすい',
      '特になし',
    ],
  };
 
  const question2 = {
    title: '普段の肌の状態を教えてください',
    options: [
      { label: '全体的に肌がつっぱる感じ', type: '乾燥肌' },
      { label: '全体的に肌がべたつく', type: '脂性肌' },
      { label: '部分的にべたつくし、つっぱる', type: '混合肌' },
      { label: 'つっぱらないし、べたつかない', type: '普通肌' },
    ],
  };
 
  const question3 = {
    title: 'あなたの毛穴の状態に近いものを選んでください',
    options: [
      { label: '黒ずみ毛穴', img: '/blackhead.jpg' },
      { label: 'たるみ毛穴', img: '/sagging.jpg' },
      { label: '詰まり毛穴', img: '/clogged.jpg' },
      { label: '気にならない', img: '/normal.jpg' },
    ],
  };
 
 
  // データを送信する関数
  const sendData = async () => {
  const match = question2.options.find(o => o.label === selected2);
  const skin_type = match ? match.type : '';
    setIsLoading(true);
    setError(null);
 
    try {
      const res = await fetch('http://localhost:8000/api/recommend/return/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
         
          data1: selected1,
          data2: skin_type,
          data3: selected3
         
        })
      });
 
      if (!res.ok) {
        throw new Error(`HTTPエラー: ${res.status}`);
      }
 
      const data = await res.json();
      setRecommends(data.recommends);
      console.log('サーバーからのレスポンス:', data);
      return data;
 
    } catch (error) {
      console.error('送信エラー:', error);
      setError('データの送信に失敗しました');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
 
  // 決定ボタンの処理
  const handleDecision = () => {
    // バリデーション
    if ((step === 1 && !selected1) || (step === 2 && !selected2) || (step === 3 && !selected3)) {
      setError('選択してください');
      return false;
    }
 
    setError(null);
 
    // 最後のステップの場合
    if (step === 3) {
      const match = question2.options.find(o => o.label === selected2);
      const type = match ? match.type : '';
      setResult(`あなたの肌タイプは ${type}`);
      return true; // 成功
    }
 
    // 次のステップへ
    setStep(prev => prev + 1);
    return false; // まだ最後ではない
  };
 
  // 決定ボタンをクリックした時の処理
  const handleClick = async () => {
    const isLastStep = handleDecision();
 
    // 最後のステップ（3問目）の場合のみデータを送信
    if (isLastStep) {
      try {
        await sendData();
        setStep(4); // 結果画面へ
      } catch (error) {
        // エラーは既にsetErrorで設定済み
      }
    }
  };
 
  // 戻るボタンの処理
  const handleBack = () => {
    setError(null);
    setStep(prev => Math.max(1, prev - 1));
  };
 
  // もう一度診断するボタンの処理
  const handleRestart = () => {
    setStep(1);
    setSelected1('');
    setSelected2('');
    setSelected3('');
    setResult('');
    setError(null);
  };
 
  // 質問を表示する関数
  const renderQuestion = (question, selected, setSelected, name) => (
    <div>
      <h2>{question.title}</h2>
      <form>
        {question.options.map((option, index) => {
          const label = typeof option === 'string' ? option : option.label;
          const img = option.img;
          return (
            <label key={index} style={{ display: 'block', marginBottom: '8px' }}>
              <input
                type="radio"
                name={name}
                value={label}
                checked={selected === label}
                onChange={() => setSelected(label)}
              />
              {label}
              {img && (
                <div>
                  <img
                    src={img}
                    alt={`${label}の参考画像`}
                    style={{ width: '100px', marginTop: '4px' }}
                  />
                </div>
              )}
            </label>
          );
        })}
      </form>
 
      {error && <p style={{ color: 'red' }}>{error}</p>}
 
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? '送信中...' : '決定'}
      </button>
 
      {step > 1 && <button onClick={handleBack}>戻る</button>}
    </div>
  );
 
  // ステップごとの表示
  if (step === 1) return renderQuestion(question1, selected1, setSelected1, 'q1');
  if (step === 2) return renderQuestion(question2, selected2, setSelected2, 'q2');
  if (step === 3) return renderQuestion(question3, selected3, setSelected3, 'q3');
 
  // 結果画面
  return (
<div>
  <h2>診断結果</h2>
  <p><b>【1問目】</b><br />{question1.title}<br />あなたの回答：{selected1}</p>
  <p><b>【2問目】</b><br />{question2.title}<br />あなたの回答：{selected2}</p>
  <p><b>【3問目】</b><br />{question3.title}<br />あなたの回答：{selected3}</p>
  <hr />
 
  <p><b>{result}</b></p>
  <p>の傾向があります</p>
    <button onClick={handleRestart}>もう一度診断する</button>
  <button onClick={handleBack}>戻る</button>
  <br />
  <a href="/">Reactのページに戻る</a>
  {/* 推奨成分の表示 */}
  <div className="recommends-section">
    <h3>あなたにおすすめの成分</h3>
    {recommends && recommends.length > 0 ? (
      <ul>
        {recommends.map((ingredient, index) => (
          <li key={index}>
            <strong>{ingredient.name}</strong>
            <p>{ingredient.comment}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p>推奨成分を読み込み中...</p>
    )}
  </div>
</div>
   
  );
}