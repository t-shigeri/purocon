import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCreateForm from "./ProductCreateForm";
import ProductEditModal from "./ProducxtEditModal.jsx"; // (1) 編集モーダルをインポート
import "./ProductEditModal.css"; // (2) モーダルのCSSをインポート

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (3) どの商品を編集中か管理する state (null = 編集してない)
  const [editingProduct, setEditingProduct] = useState(null);

  // APIからデータを取得する関数
  const fetchProducts = () => {
    setLoading(true);
    const API_URL = "http://localhost:8000/api/products/";
    axios
      .get(API_URL)
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("商品データの取得に失敗しました。");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 削除処理の関数
  const handleDelete = (id) => {
    if (window.confirm("本当にこの商品を削除しますか？")) {
      const API_URL = `http://localhost:8000/api/products/${id}/`;
      axios
        .delete(API_URL)
        .then((response) => {
          alert("商品を削除しました。");
          fetchProducts();
        })
        .catch((error) => {
          alert("商品の削除に失敗しました。");
        });
    }
  };

  // (4) 編集ボタンが押された時の処理
  //    (どの商品を編集するか state にセットする)
  const handleEditClick = (product) => {
    setEditingProduct(product);
  };

  // (5) モーダルが閉じられた時の処理
  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  // (6) モーダルでの更新が成功した時の処理
  const handleUpdateSuccess = () => {
    setEditingProduct(null); // モーダルを閉じる
    fetchProducts(); // 一覧を再読み込み
  };

  // --- レンダリング ---
  if (loading && products.length === 0) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: "red" }}>エラー: {error}</div>;

  return (
    <div>
      <ProductCreateForm onProductAdded={fetchProducts} />
      <hr style={{ margin: "2rem 0" }} />
      <h2>商品一覧</h2>
      {loading && <div>一覧を更新中...</div>}

      {/* ... (table, thead) ... */}
      <table className="product-table">
        <thead>{/* ... (th) ... */}</thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              {/* ... (td: id, 画像, 商品名, 価格) ... */}
              <td>
                <img
                  src={
                    product.images?.[0]?.content
                      ? product.images[0].content.startsWith("http")
                        ? product.images[0].content
                        : `http://localhost:8000${product.images[0].content}`
                      : "default-image-path.jpg" // (念の為のデフォルト画像)
                  }
                  alt={product.product_name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </td>
              <td>{product.product_name}</td>
              <td>{product.price} 円</td>

              {/* --- (7) 編集ボタンに onClick を追加 --- */}
              <td>
                <button onClick={() => handleEditClick(product)}>編集</button>
                <button onClick={() => handleDelete(product.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- (8) モーダルコンポーネントをレンダリング --- */}
      {/* editingProduct がセットされている時だけモーダルが表示される */}
      <ProductEditModal
        product={editingProduct}
        onClose={handleCloseModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

export default ProductList;
