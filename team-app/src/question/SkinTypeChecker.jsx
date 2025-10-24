import React, { useState } from 'react';
 
export default function SkinTypeChecker() {
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState('');
  const options = [
    { label: '全体的に肌がつっぱる感じ', type: '乾燥肌' },
    { label: '全体的に肌がべたつく', type: '脂性肌' },
    { label: '部分的にべたつくし、つっぱる', type: '混合肌' },
    { label: 'つっぱらないし、べたつかない', type: '普通肌' },
  ];

  const handleDecision = () => {
    const match = options.find(option => option.label === selected);
    if (match) {
      setResult(`あなたの肌タイプは「${match.type}」です。`);
    } else {
      setResult('肌の状態を選択してください。');
    }
  };

  return (
    <div>
      <h2>まずは肌について教えてください</h2>
      <form>
        {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label>{option.label}</label>
            <input
              type="radio"
              name="skinType"
              value={option.label}
              checked={selected === option.label}
              onChange={() => setSelected(option.label)}
            />
          </div>
        ))}
      </form>
      <button onClick={handleDecision} style={{ marginTop: '20px' }}>決定</button>
      {result && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{result}</p>}
    </div>
  );
}
 
 