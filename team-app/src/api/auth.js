const API_URL = 'http://localhost:8000/api';

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('認証トークンがありません');
  }
  
  const response = await fetch(`${API_URL}/user/me/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('ユーザー情報の取得に失敗しました');
  }
  
  return await response.json();
};