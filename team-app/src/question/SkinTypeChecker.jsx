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

  const handleDecision = () => {
    if ((step === 1 && !selected1) || (step === 2 && !selected2) || (step === 3 && !selected3)) {
      setResult('選択してください');
      return;
    }

    setResult('');
    if (step === 3) {
      const match = question2.options.find(o => o.label === selected2);
      const type = match ? match.type : '';
      setResult(`あなたの肌タイプは ${type}`);
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setResult('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleRestart = () => {
    setStep(1);
    setSelected1('');
    setSelected2('');
    setSelected3('');
    setResult('');
  };

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
              {img && step !== 4 && (
                <div>
                  <img src={img} alt={`${label}の参考画像`} style={{ width: '100px', marginTop: '4px' }} />
                </div>
              )}
            </label>
          );
        })}
      </form>
      <button onClick={handleDecision}>決定</button>
      {!selected && result && <p>選択してください</p>}
      {step > 1 && <button onClick={handleBack}>戻る</button>}
    </div>
  );

  if (step === 1) return renderQuestion(question1, selected1, setSelected1, 'q1');
  if (step === 2) return renderQuestion(question2, selected2, setSelected2, 'q2');
  if (step === 3) return renderQuestion(question3, selected3, setSelected3, 'q3');

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
      ／Reactのページに戻るボタン／
    </div>
  );
}