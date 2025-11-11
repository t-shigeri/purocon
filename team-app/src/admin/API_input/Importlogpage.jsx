import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const Importlogpage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/product-import/`);
      setLogs(response.data);
    } catch (err) {
      console.error('ログの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: '処理中' },
      success: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: '成功' },
      partial: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '⚠️', label: '一部成功' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕', label: '失敗' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getSuccessRate = (log) => {
    if (log.total_count === 0) return 0;
    return Math.round((log.success_count / log.total_count) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">インポートログ</h1>
            <p className="text-gray-600 mt-1">過去のインポート履歴を確認</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold shadow-md transition-all"
          >
            {loading ? '読込中...' : '🔄 更新'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    実行日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API設定
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    結果
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成功率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-lg font-semibold">インポートログがありません</p>
                      <p className="text-sm mt-2">商品インポートを実行すると、ここに履歴が表示されます</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const successRate = getSuccessRate(log);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">📅</span>
                            <div>
                              <div className="font-medium">
                                {new Date(log.created_at).toLocaleDateString('ja-JP')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(log.created_at).toLocaleTimeString('ja-JP')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {log.api_config_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="text-gray-600">総件数:</span>
                              <span className="ml-2 font-semibold">{log.total_count}</span>
                            </div>
                            <div className="flex items-center text-green-600">
                              <span>成功:</span>
                              <span className="ml-2 font-semibold">{log.success_count}</span>
                            </div>
                            {log.failed_count > 0 && (
                              <div className="flex items-center text-red-600">
                                <span>失敗:</span>
                                <span className="ml-2 font-semibold">{log.failed_count}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  successRate === 100 ? 'bg-green-500' :
                                  successRate >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${successRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{successRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {log.error_message && (
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              エラー詳細 →
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* エラー詳細モーダル */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">エラー詳細</h2>
                    <p className="text-sm text-gray-600 mt-1">インポートエラーの詳細情報</p>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">API設定</div>
                    <div className="font-semibold">{selectedLog.api_config_name}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">実行日時</div>
                    <div className="font-semibold">
                      {new Date(selectedLog.created_at).toLocaleString('ja-JP')}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">ステータス</div>
                  <div>{getStatusBadge(selectedLog.status)}</div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="text-sm text-blue-600 mb-1">総件数</div>
                    <div className="text-2xl font-bold">{selectedLog.total_count}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="text-sm text-green-600 mb-1">成功</div>
                    <div className="text-2xl font-bold">{selectedLog.success_count}</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <div className="text-sm text-red-600 mb-1">失敗</div>
                    <div className="text-2xl font-bold">{selectedLog.failed_count}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">エラーメッセージ</div>
                  <pre className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm overflow-x-auto text-red-800 whitespace-pre-wrap">
                    {selectedLog.error_message}
                  </pre>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t p-6">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Importlogpage;