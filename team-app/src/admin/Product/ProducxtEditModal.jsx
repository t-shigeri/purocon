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

  // --- (2) 画像管理用の state を追加 ---
  // (A) 新しくアップロードする画像ファイル (FileList)
  const [newImages, setNewImages] = useState(null);
  // (B) 削除対象にマークされた既存画像の ID リスト
  const [deletingImageIds, setDeletingImageIds] = useState([]);

  // (3) props.product が変更されたら (モーダルが開かれたら)、
  //     フォームの state を初期化する
  useEffect(() => {
    if (product) {
      // テキストデータをセット
      setFormData({
        product_name: product.product_name || "",
        ingredients_list: product.ingredients_list || "",
        price: product.price || 0,
      });
      // 画像関連の state をリセット
      setNewImages(null);
      setDeletingImageIds([]);
      setError(null);
    }
  }, [product]); // product が変わるたびに実行

  // (4) フォームの入力値を state に反映する
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // (5) 既存画像を「削除リスト」に追加する
  const markImageForDeletion = (imageId) => {
    // 既にリストになければ追加する
    if (!deletingImageIds.includes(imageId)) {
      setDeletingImageIds((prevIds) => [...prevIds, imageId]);
    }
  };

  // (6) フォーム送信 (保存) の処理
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // (A) テキストとファイルを同時に送るため FormData を使用
    const data = new FormData();

    // (B) テキストデータを追加
    data.append("product_name", formData.product_name);
    data.append("ingredients_list", formData.ingredients_list);
    data.append("price", formData.price);

    // (C) 削除する画像の ID リストを追加
    //     (DRF Serializer の 'images_to_delete' と名前を合わせる)
    deletingImageIds.forEach((id) => {
      data.append("images_to_delete", id);
    });

    // (D) 新規追加する画像ファイルを追加
    //     (DRF Serializer の 'uploaded_images' と名前を合わせる)
    if (newImages) {
      for (let i = 0; i < newImages.length; i++) {
        data.append("uploaded_images", newImages[i]);
      }
    }

    const API_URL = `http://localhost:8000/api/products/${product.id}/`;

    // (E) PATCH リクエストで FormData を送信
    axios
      .patch(API_URL, data)
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

  // (7) モーダルの表示
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

          {/* --- ▼▼▼ 画像管理セクション ▼▼▼ --- */}
          <div>
            <label>現在の画像:</label>
            <div className="image-preview-container">
              {product.images && product.images.length > 0 ? (
                product.images.map((image) => (
                  <div
                    key={image.id}
                    className={`image-preview-item ${
                      deletingImageIds.includes(image.id)
                        ? "marked-for-deletion"
                        : ""
                    }`}
                  >
                    <img
                      src={
                        image.content.startsWith("http")
                          ? image.content
                          : `http://localhost:8000${image.content}`
                      }
                      alt="商品画像"
                    />
                    {/* 削除(x)ボタン */}
                    <button
                      type="button"
                      className="delete-image-btn"
                      onClick={() => markImageForDeletion(image.id)}
                    >
                      &times; {/* 'x' のHTMLエンティティ */}
                    </button>
                  </div>
                ))
              ) : (
                <p>画像はありません。</p>
              )}
            </div>
          </div>

          <div>
            <label>画像を追加 (複数選択可):</label>
            <input
              type="file"
              multiple
              onChange={(e) => setNewImages(e.target.files)}
            />
          </div>
          {/* --- ▲▲▲ 画像管理セクションここまで --- */}

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
