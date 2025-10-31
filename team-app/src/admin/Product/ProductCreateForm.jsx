import React, { useState } from "react";
import axios from "axios";

// ProductListから渡される onProductAdded 関数を受け取る
function ProductCreateForm({ onProductAdded }) {
  // フォームの各項目を state で管理
  const [productName, setProductName] = useState("");
  const [ingredientsList, setIngredientsList] = useState("");
  const [price, setPrice] = useState("");
  const [selectedImages, setSelectedImages] = useState(null); // 画像ファイル
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // フォーム送信時の処理
  const handleSubmit = (e) => {
    e.preventDefault(); // フォームのデフォルト送信（ページリロード）を防止
    setLoading(true);
    setError(null);

    // --- FormData の作成 ---
    // ファイルを送信するためには FormData オブジェクトが必要です
    const formData = new FormData();

    // 1. テキストデータを追加
    formData.append("product_name", productName);
    formData.append("ingredients_list", ingredientsList);
    formData.append("price", price);

    // 2. 画像データを追加
    // DRF側 (ProductCreateSerializer) の 'uploaded_images' と名前を合わせます
    if (selectedImages) {
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append("uploaded_images", selectedImages[i]);
      }
    }

    // DRFのAPIエンドポイント
    const API_URL = "http://localhost:8000/api/products/";

    // axios.post で FormData を送信
    // (axios は自動的に 'Content-Type': 'multipart/form-data' を設定します)
    axios
      .post(API_URL, formData)
      .then((response) => {
        // 成功時の処理
        setLoading(false);
        alert("新しい商品を登録しました！");

        // フォームをリセット
        setProductName("");
        setIngredientsList("");
        setPrice("");
        setSelectedImages(null);
        e.target.reset(); // (file input をリセットするため)

        // 親コンポーネント（ProductList）に通知して一覧を更新
        if (onProductAdded) {
          onProductAdded();
        }
      })
      .catch((error) => {
        // 失敗時の処理
        setLoading(false);
        console.error(
          "Error creating product:",
          error.response?.data || error.message
        );
        setError("商品の登録に失敗しました。");
      });
  };

  return (
    <div>
      <h2>新規商品登録</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>商品名:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>成分リスト:</label>
          <textarea
            value={ingredientsList}
            onChange={(e) => setIngredientsList(e.target.value)}
          />
        </div>
        <div>
          <label>価格 (円):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>商品画像 (複数選択可):</label>
          <input
            type="file"
            multiple // 複数ファイル選択を許可
            onChange={(e) => setSelectedImages(e.target.files)} // files を state にセット
          />
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "登録中..." : "登録する"}
        </button>
      </form>
    </div>
  );
}

export default ProductCreateForm;
