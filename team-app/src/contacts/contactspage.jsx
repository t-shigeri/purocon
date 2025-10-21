import { useState } from 'react';
 
export default function Contactspage() {
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
 
        try {
            const response = await fetch('http://localhost:8000/contacts/text/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });
 
            const data = await response.json();
            console.log('サーバーからのレスポンス:', data);
            if (response.ok) {
                console.log('成功:', data);
                setText(''); // フォームをクリア
            } else {
                // バリデーションエラーの表示
                console.error('エラー詳細:', data); // ←重要！
            setError(JSON.stringify(data))
            }
        } catch (err) {
            setError('ネットワークエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="テキストを入力してください"
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? '送信中...' : '送信'}
            </button>
        </form>
    );
}