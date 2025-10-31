import React, { useState, useEffect } from "react";
import axios from "axios";
// (CSSでモーダルをスタイリングするため)
import "./ProductEditModal.css";

// props として 編集対象の 'product', 閉じるための 'onClose',
// 更新成功を親に伝える 'onUpdateSuccess' を受け取る
function ProductEditModal({ product, onClose, onUpdateSuccess }) {
  // (1) フォームデータを管理するローカル state
  const [formData, setFormData] = useState({
    product_name: "",
    ingredients_list: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // (2) props.product が変更されたら (モーダルが開かれたら)、
  //     フォームの state を初期化する
  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name || "",
        ingredients_list: product.ingredients_list || "",
        price: product.price || 0,
      });
      // モーダルが開くときにエラーをリセット
      setError(null);
    }
  }, [product]); // product が変わるたびに実行

  // (3) フォームの入力値を state に反映する
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // (4) フォーム送信 (保存) の処理
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // PATCH リクエスト (部分更新) を使用
    // ProductUpdateSerializer が受け付けるデータのみを送信
    const API_URL = `http://localhost:8000/api/products/${product.id}/`;

    axios
      .patch(API_URL, formData)
      .then((response) => {
        setLoading(false);
        alert("商品情報を更新しました。");
        onUpdateSuccess(); // 親コンポーネントに成功を通知
      })
      .catch((error) => {
        setLoading(false);
        console.error(
          "Error updating product:",
          error.response?.data || error.message
        );
        setError("更新に失敗しました。");
      });
  };

  // product が null の場合 (モーダルが閉ている) は何も表示しない
  if (!product) {
    return null;
  }

  // (5) モーダルの表示
  return (
    // 'modal-overlay' で背景をクリックしたら onClose で閉じる
    <div className="modal-overlay" onClick={onClose}>
      {/* 'modal-content' 内部のクリックは伝播を止めて閉じないようにする */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>商品編集 (ID: {product.id})</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>商品名:</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>成分リスト:</label>
            <textarea
              name="ingredients_list"
              value={formData.ingredients_list}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>価格 (円):</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div style={{ color: "red" }}>{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              キャンセル
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEditModal;
