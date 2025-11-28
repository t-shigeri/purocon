// src/components/DataProcessor.jsx
import { useState } from 'react';

function DataProcessor() {
  const [inputData, setInputData] = useState({
    text: '',
    number: 0
  });
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8000/api/process/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData)
      });
      
      const data = await res.json();
      setResult(data);

    } catch (error) {
      console.error('エラー:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputData.text}
          onChange={(e) => setInputData({...inputData, text: e.target.value})}
          placeholder="テキスト"
        />
        <input
          type="number"
          value={inputData.number}
          onChange={(e) => setInputData({...inputData, number: parseInt(e.target.value)})}
          placeholder="数値"
        />
        <button type="submit">送信</button>
      </form>
      
      {result && (
        <div>
          <p>処理結果: {result.processed_text}</p>
          <p>計算結果: {result.calculated_number}</p>
        </div>
      )}
    </div>
  );
}

export default DataProcessor;