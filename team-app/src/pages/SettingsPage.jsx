import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // 仮のAuthContext
import PasswordChangeForm from "../admin/settings/PasswordChangeForm";
import UserManagement from "../components/UserManagement";

function SettingsPage() {
  // AuthContextからログイン中のユーザー情報を取得
  const { user } = useContext(AuthContext);

  if (!user) {
    return <p>Loading...</p>; // ユーザー情報読み込み中
  }

  return (
    <div>
      <h2>設定</h2>

      {/* 1. 自分のパスワード変更 (全管理者が対象) */}
      <PasswordChangeForm />

      <hr style={{ margin: "2rem 0" }} />

      {/* 2. ユーザー管理 (スーパー管理者のみ) */}
      {user.is_superuser ? (
        <UserManagement />
      ) : (
        <p>管理者アカウントの管理はスーパーユーザーのみ可能です。</p>
      )}
    </div>
  );
}

export default SettingsPage;
