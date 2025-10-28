import React, { useState, useEffect } from "react";
import api from "../api/withToken.js";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // 1. マウント時にユーザー一覧を取得
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // DRFの /api/admin/users/ エンドポイントに GET
      const response = await api.get("/admin/users/");
      setUsers(response.data);
    } catch (err) {
      setError("ユーザー一覧の取得に失敗しました。");
    }
  };

  // 2. ユーザー削除機能
  const handleDelete = async (userId) => {
    if (window.confirm("本当にこのユーザーを削除しますか？")) {
      try {
        // DRFの /api/admin/users/{id}/ エンドポイントに DELETE
        await api.delete(`/admin/users/${userId}/`);
        // 成功したらリストから削除
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err) {
        setError("削除に失敗しました。");
      }
    }
  };

  // TODO: ユーザー新規作成フォーム (POST /api/admin/users/)
  const handleCreate = () => {
    // (モーダルを開いてフォームを表示する処理)
    console.log("新規作成処理");
  };

  // TODO: ユーザー編集フォーム (PUT /api/admin/users/{id}/)
  const handleEdit = (user) => {
    // (モーダルを開いてフォームを表示する処理)
    console.log("編集処理", user);
  };

  return (
    <div>
      <h3>管理者アカウント管理</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleCreate}>新規管理者を追加</button>
      <table border="1" style={{ width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>ユーザー名</th>
            <th>Email</th>
            <th>スーパーユーザー</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.is_superuser ? "はい" : "いいえ"}</td>
              <td>
                <button onClick={() => handleEdit(user)}>編集</button>
                <button onClick={() => handleDelete(user.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
