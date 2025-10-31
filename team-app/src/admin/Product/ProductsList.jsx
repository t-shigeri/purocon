import React, { useState, useEffect } from "react";
import axios from "axios";
// (CSSを適用する場合)
// import './ProductList.css';

function ProductList() {
  // --- Stateの定義 ---
  const [products, setProducts] = useState([]); // 商品データを保持する
  const [loading, setLoading] = useState(true); // 読み込み中かどうか
  const [error, setError] = useState(null); // エラーメッセージ

  // --- データ取得処理 ---
  useEffect(() => {
    // DRF APIのエンドポイント (Djangoサーバが8000番ポートで動いていると仮定)
    const API_URL = "http://localhost:8000/api/products/";

    // axios を使ってGETリクエストを送信
    axios
      .get(API_URL)
      .then((response) => {
        // 成功時: データをstateに保存
        setProducts(response.data);
        setLoading(false); // 読み込み完了
      })
      .catch((error) => {
        // 失敗時: エラーメッセージをstateに保存
        console.error("API Error:", error);
        setError("商品データの取得に失敗しました。");
        setLoading(false); // 読み込み完了 (エラー)
      });
  }, []); // [] を指定することで、コンポーネントのマウント時に1回だけ実行

  // --- レンダリング(表示)処理 ---

  // (1) 読み込み中の表示
  if (loading) {
    return <div>読み込み中...</div>;
  }

  // (2) エラー発生時の表示
  if (error) {
    return <div style={{ color: "red" }}>エラー: {error}</div>;
  }

  // (3) 登録データがない場合の表示
  if (products.length === 0) {
    return <div>登録されている商品がありません。</div>;
  }

  // (4) 正常時の表示
  return (
    <div>
      <h2>商品一覧</h2>

      {/* (CSSでスタイルを当てると見やすくなります) */}
      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>画像</th>
            <th>商品名</th>
            <th>価格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {/* 画像が存在するか (product.images?.[0]?.content) をまず確認
                 */}
                {product.images?.[0]?.content && (
                  <img
                    src={
                      /* URLが 'http' から始まっていればそのまま使い、
                        始まっていなければ (例: /media/...)、
                        バックエンドのドメインを先頭に追加します。
                      */
                      product.images[0].content.startsWith("http")
                        ? product.images[0].content
                        : `http://localhost:8000${product.images[0].content}`
                    }
                    alt={product.product_name}
                    style={{
                      width: "50px", // 幅を 100px に固定
                      height: "100px", // 高さを 100px に固定
                      objectFit: "cover", // はみ出た部分をトリミング (CSSの object-fit: cover)
                      borderRadius: "8px", // (オプション: 角を丸くすると見栄えが良くなります)
                    }}
                  />
                )}
              </td>
              <td>{product.product_name}</td>
              <td>{product.price} 円</td>
              <td>
                <button>編集</button>
                <button>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;
