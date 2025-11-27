import React, { useState } from 'react';

export default function SkinTypeChecker({ onBack }) {
  const [step, setStep] = useState(1);
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);
  const [selected3, setSelected3] = useState([]);
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
      { label: '(乾燥肌)全体的に肌がつっぱる感じ', type: '乾燥肌' },
      { label: '(脂性肌)全体的に肌がべたつく', type: '脂性肌' },
      { label: '(混合肌)部分的にべたつくし、つっぱる', type: '混合肌' },
      { label: '(普通肌)つっぱらないし、べたつかない', type: '普通肌' },
    ],
  };

  const question3 = {
    title: 'あなたの毛穴の状態に近いものを選んでください',
    options: [
      { label: '黒ずみ毛穴', img: '/Blackheads and pores.png' },
      { label: 'たるみ毛穴', img: '/Sagging pores.png' },
      { label: '詰まり毛穴', img: '/Clogged pores.png' },
      { label: '気にならない', img: '/normal.png' },
    ],
  };

  const toggleSelection = (selected, setSelected, value) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      if (step === 1) {
        if (value === '特になし') {
          setSelected(['特になし']);
        } else {
          setSelected(selected.filter(v => v !== '特になし').concat(value));
        }
      } else {
        setSelected([...selected, value]);
      }
    }
  };

  const handleDecision = () => {
    if ((step === 1 && selected1.length === 0) ||
        (step === 2 && selected2.length === 0) ||
        (step === 3 && selected3.length === 0)) {
      setResult('選択してください');
      return;
    }

    setResult('');
    if (step === 3) {
      const types = selected2.map(sel => {
        const match = question2.options.find(o => o.label === sel);
        return match ? match.type : '';
      });
      setResult(`あなたの肌タイプは ${types.join(', ')}`);
    }
    setStep(prev => prev + 1);
  };

  const handleRestart = () => {
    setStep(1);
    setSelected1([]);
    setSelected2([]);
    setSelected3([]);
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
            <label key={index}>
              <input
                type="checkbox"
                name={name}
                value={label}
                checked={selected.includes(label)}
                onChange={() => toggleSelection(selected, setSelected, label)}
              />
              {label}
              {img && (
                <div>
                  <img src={img} alt={`${label}の参考画像`} style={{ width: '100px' }} />
                </div>
              )}
            </label>
          );
        })}
      </form>
      <button type="button" onClick={handleDecision}>決定</button>
      {selected.length === 0 && result === '選択してください' && <p>{result}</p>}
      {step > 1 && <button type="button" onClick={() => setStep(prev => prev - 1)}>戻る</button>}
    </div>
  );

  if (step === 1) return renderQuestion(question1, selected1, setSelected1, 'q1');
  if (step === 2) return renderQuestion(question2, selected2, setSelected2, 'q2');
  if (step === 3) return renderQuestion(question3, selected3, setSelected3, 'q3');

  return (
    <div>
      <h2>診断結果</h2>
      <p><b>【1問目】</b><br />{question1.title}<br />あなたの回答：{selected1.join(', ')}</p>
      <p><b>【2問目】</b><br />{question2.title}<br />あなたの回答：{selected2.join(', ')}</p>
      <p><b>【3問目】</b><br />{question3.title}<br />あなたの回答：{selected3.join(', ')}</p>
      <hr />
      <p><b>{result}</b></p>
      <p>の傾向があります</p>

      {selected1.length > 0 && !selected1.includes('特になし') && (
        <p>敏感肌の傾向があります</p>
      )}

      <button type="button" onClick={handleRestart}>もう一度診断する</button>
      <button type="button" onClick={() => setStep(prev => prev - 1)}>戻る</button>
      <br />
      {/* App.jsxに戻るボタン */}
      <button type="button" onClick={onBack}>Appに戻る</button>
    </div>
  );
}