import React, { useState } from 'react';
 
export default function SkinTypeChecker() {
  const [step, setStep] = useState(1);
  const [selected1, setSelected1] = useState('');
  const [selected2, setSelected2] = useState('');
  const [selected3, setSelected3] = useState('');
  const [result, setResult] = useState('');
 
  const question1 = {
    title: '以下のような肌の状態はありますか？',
    options: [
      '化粧水・クリームなど新しいスキンケアを使うと赤くなったり痒くなることがある',
      '季節・気温・生活習慣（睡眠不足・ストレス）で急に肌が荒れやすい',
      '汗やマスク・摩擦など、ちょっとした刺激でヒリつく',
      'ニキビではなく、赤み・ひりひり・かゆみ系のトラブルが出やすい',
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
 
  const handleDecision = () => {
    if (step === 1) {
      if (!selected1) return setResult('どれか1つ選択してください。');
      setResult('');
      setStep(2);
    } else if (step === 2) {
      if (!selected2) return setResult('肌の状態を選択してください。');
      setResult('');
      setStep(3);
    } else if (step === 3) {
      if (!selected3) return setResult('毛穴の状態を選択してください。');
      const match = question2.options.find(o => o.label === selected2);
      const type = match ? match.type : '';
      setResult(
        `あなたの肌タイプは「${type}」です。`
      );
      setStep(4);
    }
  };
 
  const handleRestart = () => {
    setStep(1);
    setSelected1('');
    setSelected2('');
    setSelected3('');
    setResult('');
  };
 
  // --- 1問目 ---
  if (step === 1)
    return (
      <div>
        <h2>{question1.title}</h2>
        <form>
          {question1.options.map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                name="q1"
                value={option}
                checked={selected1 === option}
                onChange={() => setSelected1(option)}
              />
              {option}
            </label>
          ))}
        </form>
        <button onClick={handleDecision}>決定</button>
        {result && <p>{result}</p>}
      </div>
    );
 
  // --- 2問目 ---
  if (step === 2)
    return (
      <div>
        <h2>{question2.title}</h2>
        <form>
          {question2.options.map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                name="q2"
                value={option.label}
                checked={selected2 === option.label}
                onChange={() => setSelected2(option.label)}
              />
              {option.label}
            </label>
          ))}
        </form>
        <button onClick={handleDecision}>決定</button>
        {result && <p>{result}</p>}
      </div>
    );
 
  // --- 3問目 ---
  if (step === 3)
    return (
      <div>
        <h2>{question3.title}</h2>
        <div>
          {question3.options.map((option, index) => (
            <label key={index}>
              ／画像：{option.img}／<br />
              <input
                type="radio"
                name="q3"
                value={option.label}
                checked={selected3 === option.label}
                onChange={() => setSelected3(option.label)}
              />
              {option.label}
              <br />
            </label>
          ))}
        </div>
        <button onClick={handleDecision}>決定</button>
        {result && <p>{result}</p>}
      </div>
    );
 
  // --- 結果画面 ---
  if (step === 4)
    return (
      <div>
        <h2>診断結果</h2>
        <p><b>【1問目】</b><br />{question1.title}<br />あなたの回答：{selected1}</p>
        <p><b>【2問目】</b><br />{question2.title}<br />あなたの回答：{selected2}</p>
        <p><b>【3問目】</b><br />{question3.title}<br />
        ／画像：{question3.options.find(o => o.label === selected3)?.img}／<br />
        あなたの回答：{selected3}</p>
        <hr />
        <p><b>{result}</b></p>
 
        <button onClick={handleRestart}>もう一度診断する</button>
        <br />
        ／Reactのページに戻るボタン／
      </div>
    );
}
 