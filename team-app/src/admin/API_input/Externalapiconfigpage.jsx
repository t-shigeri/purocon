import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const Externalapiconfigpage = () => {
  const [configs, setConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    api_url: '',
  });

  const [testResult, setTestResult] = useState(null);
  const [detectedColumns, setDetectedColumns] = useState([]);

  const [columnMappings, setColumnMappings] = useState({
    product_name: { external_column: '', json_path: '' },
    ingredients_list: { external_column: '', json_path: '' },
    price: { external_column: '', json_path: '' },
    image_url: { external_column: '', json_path: '' },
  });

  const [savedConfigId, setSavedConfigId] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/external-api-configs/`);
      setConfigs(response.data);
    } catch (err) {
      console.error('API設定の取得に失敗:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      // URLから店舗名を自動生成
      const urlObj = new URL(formData.api_url);
      const autoStoreName = urlObj.hostname || 'API Store';

      const response = await axios.get(formData.api_url);

      setTestResult(response.data);
      
      // レスポンスからカラムを検出
      const columns = extractColumns(response.data);
      setDetectedColumns(columns);
      
      const saveResponse = await axios.post(`${API_BASE_URL}/external-api-configs/`, {
        store_name: autoStoreName,
        api_url: formData.api_url,
        api_key: 'no-auth-required', // 認証不要
        sample_data: response.data,
      });

      setSavedConfigId(saveResponse.data.id);
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'API接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // カラムを抽出する関数
  const extractColumns = (data, prefix = '') => {
    const columns = [];
    
    // データが配列の場合、最初の要素を使用
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
      prefix = prefix ? prefix + '[0].' : '[0].';
    }
    
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        const currentPath = prefix ? `${prefix}${key}` : key;
        const valueType = Array.isArray(value) ? 'array' : typeof value;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // ネストされたオブジェクト
          columns.push({
            column_name: key,
            json_path: currentPath,
            type: 'object',
            sample_value: JSON.stringify(value).substring(0, 100),
            is_nested: true
          });
          // 再帰的に展開
          const nested = extractColumns(value, currentPath + '.');
          columns.push(...nested);
        } else if (Array.isArray(value)) {
          // 配列
          columns.push({
            column_name: key,
            json_path: currentPath,
            type: 'array',
            sample_value: `[${value.length} items]`,
            is_nested: true
          });
          if (value.length > 0) {
            const nested = extractColumns(value[0], currentPath + '[0].');
            columns.push(...nested);
          }
        } else {
          // プリミティブ値
          columns.push({
            column_name: key,
            json_path: currentPath,
            type: valueType,
            sample_value: value,
            is_nested: false
          });
        }
      }
    }
    
    return columns;
  };

  const handleNextToMapping = () => {
    setCurrentStep(3);
  };

  const handleColumnClick = (internalColumn, columnInfo) => {
    setColumnMappings(prev => ({
      ...prev,
      [internalColumn]: {
        external_column: columnInfo.column_name,
        json_path: columnInfo.json_path,
      }
    }));
  };

  const handleSaveMappings = async () => {
    setLoading(true);
    setError(null);

    try {
      const mappingsArray = Object.entries(columnMappings)
        .filter(([_, mapping]) => mapping.external_column)
        .map(([internal_column, mapping]) => ({
          internal_column,
          external_column: mapping.external_column,
          json_path: mapping.json_path || mapping.external_column,
          transformation_rule: internal_column === 'price' ? 'to_int' : 'none',
        }));

      await axios.post(`${API_BASE_URL}/column-mappings/bulk_create/`, {
        api_config_id: savedConfigId,
        mappings: mappingsArray,
      });

      alert('マッピングが保存されました!');
      setShowForm(false);
      setCurrentStep(1);
      fetchConfigs();
      
      setFormData({ api_url: '' });
      setTestResult(null);
      setDetectedColumns([]);
      setColumnMappings({
        product_name: { external_column: '', json_path: '' },
        ingredients_list: { external_column: '', json_path: '' },
        price: { external_column: '', json_path: '' },
        image_url: { external_column: '', json_path: '' },
      });
    } catch (err) {
      setError('マッピングの保存に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportProducts = async (configId) => {
    if (!confirm('商品データをインポートしますか?')) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/product-import/execute/`, {
        api_config_id: configId,
      });

      alert(`インポート完了!\n成功: ${response.data.result.success}件\n失敗: ${response.data.result.failed}件`);
      
    } catch (err) {
      alert('インポートに失敗しました: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!confirm('このAPI設定を削除しますか?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/external-api-configs/${configId}/`);
      alert('削除しました');
      fetchConfigs();
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const internalColumnLabels = {
    product_name: '商品名',
    ingredients_list: '成分表',
    price: '価格',
    image_url: '画像URL',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">外部API連携設定</h1>
            <p className="text-gray-600 mt-1">外部APIから商品データを自動インポート</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all"
          >
            {showForm ? '✕ キャンセル' : '+ 新規追加'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {showForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200">
            {/* プログレスバー */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {[
                  { step: 1, label: 'API設定' },
                  { step: 2, label: '接続テスト' },
                  { step: 3, label: 'マッピング' }
                ].map(({ step, label }) => (
                  <div
                    key={step}
                    className={`flex-1 text-center ${
                      currentStep >= step ? 'text-blue-600 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step}
                      </div>
                    </div>
                    {label}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* ステップ1: API情報入力 */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">API URLを入力</h2>
                <p className="text-sm text-gray-600 mb-4">
                  商品データを返すAPIのURLを入力してください。認証は不要です。
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      API URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="api_url"
                      value={formData.api_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="http://localhost:5000/api/products"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      例: http://localhost:5000/api/products
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">💡</span>
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">テスト用APIサーバー</p>
                        <p>テスト用のAPIサーバーを起動している場合:</p>
                        <code className="block mt-2 bg-white px-2 py-1 rounded">
                          http://localhost:5000/api/products
                        </code>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleTestConnection}
                    disabled={loading || !formData.api_url}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-all"
                  >
                    {loading ? '接続中...' : '接続テスト'}
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: 接続テスト結果 */}
            {currentStep === 2 && testResult && (
              <div>
                <h2 className="text-2xl font-bold mb-4">接続成功!</h2>
                <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">✓</span>
                    <span className="font-semibold">APIに正常に接続できました</span>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-3 text-lg">検出されたカラム ({detectedColumns.length}件)</h3>
                  <div className="max-h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                    {detectedColumns.map((col, idx) => (
                      <div key={idx} className="py-2 px-3 hover:bg-white rounded cursor-pointer text-sm border-b last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-mono text-blue-600 font-semibold">{col.column_name}</span>
                            {col.json_path && (
                              <div className="text-xs text-gray-500 mt-1">パス: {col.json_path}</div>
                            )}
                            {col.sample_value && (
                              <div className="text-xs text-gray-600 mt-1 p-2 bg-gray-100 rounded">
                                例: {String(col.sample_value).substring(0, 60)}{String(col.sample_value).length > 60 ? '...' : ''}
                              </div>
                            )}
                          </div>
                          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{col.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleNextToMapping}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  次へ: カラムマッピング設定 →
                </button>
              </div>
            )}

            {/* ステップ3: カラムマッピング */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-2">カラムマッピング設定</h2>
                <p className="text-sm text-gray-600 mb-6">
                  右側の外部カラムから、左側の内部カラムに対応するものを選択してください
                </p>

                <div className="grid grid-cols-2 gap-6">
                  {/* 左側: 内部カラム */}
                  <div>
                    <h3 className="font-semibold mb-3 text-blue-700 flex items-center">
                      <span className="text-xl mr-2">📥</span>
                      内部システムのカラム
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(columnMappings).map(([internalCol, mapping]) => (
                        <div
                          key={internalCol}
                          className={`p-4 border-2 rounded-lg ${
                            mapping.external_column
                              ? 'border-green-400 bg-green-50'
                              : 'border-blue-300 bg-blue-50'
                          }`}
                        >
                          <div className="font-semibold mb-1">{internalColumnLabels[internalCol]}</div>
                          <div className="text-xs text-gray-600 mb-2">({internalCol})</div>
                          {mapping.external_column ? (
                            <div className="p-2 bg-white border border-green-400 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-mono text-green-700 font-semibold">
                                    ← {mapping.external_column}
                                  </div>
                                  {mapping.json_path && (
                                    <div className="text-xs text-gray-600 mt-1">{mapping.json_path}</div>
                                  )}
                                </div>
                                <button
                                  onClick={() => setColumnMappings(prev => ({
                                    ...prev,
                                    [internalCol]: { external_column: '', json_path: '' }
                                  }))}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 italic">未設定</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右側: 外部APIのカラム */}
                  <div>
                    <h3 className="font-semibold mb-3 text-green-700 flex items-center">
                      <span className="text-xl mr-2">📤</span>
                      外部APIのカラム
                    </h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {detectedColumns.map((col, idx) => (
                        <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-mono text-sm font-semibold">{col.column_name}</div>
                              {col.json_path && (
                                <div className="text-xs text-gray-500 mt-1">{col.json_path}</div>
                              )}
                              {col.sample_value && (
                                <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                  例: {String(col.sample_value).substring(0, 50)}
                                </div>
                              )}
                            </div>
                            <div className="ml-2">
                              <select
                                className="text-xs px-2 py-1 border rounded hover:border-blue-400 cursor-pointer"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleColumnClick(e.target.value, col);
                                    e.target.value = '';
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="">マッピング</option>
                                {Object.keys(columnMappings).map(internalCol => (
                                  <option key={internalCol} value={internalCol}>
                                    → {internalColumnLabels[internalCol]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold"
                  >
                    ← 戻る
                  </button>
                  <button
                    onClick={handleSaveMappings}
                    disabled={loading || !Object.values(columnMappings).some(m => m.external_column)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                  >
                    {loading ? '保存中...' : '✓ マッピングを保存'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API設定リスト */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-xl font-bold">登録済みAPI設定</h2>
          </div>
          <div className="divide-y">
            {configs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg">API設定がありません</p>
                <p className="text-sm mt-2">「+ 新規追加」ボタンから追加してください</p>
              </div>
            ) : (
              configs.map(config => (
                <div key={config.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-lg">{config.store_name}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded ${
                          config.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {config.is_active ? '有効' : '無効'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{config.api_url}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>📊 マッピング: {config.mappings_count}件</span>
                        <span>📅 {new Date(config.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleImportProducts(config.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold transition-all"
                      >
                        📥 商品インポート
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(config.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Externalapiconfigpage;