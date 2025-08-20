'use client';

import { useState, useEffect } from 'react';
import { apiService, ResponseSuggestion, ResponseGenerationRequest } from '@/services/apiService';

export default function ResponseSuggestionManager() {
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState<'friendly' | 'professional' | 'apologetic' | 'enthusiastic' | undefined>(undefined);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      await apiService.testConnection();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!message.trim()) {
      setError('メッセージを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: ResponseGenerationRequest = {
        customerMessage: message,
        ...(selectedCustomerId && { customerId: selectedCustomerId }),
        ...(selectedTone && { preferredTone: selectedTone }),
      };

      const response = await apiService.generateResponseSuggestions(request);
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提案生成中にエラーが発生しました');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (suggestion: ResponseSuggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.content);
      setCopiedId(suggestion.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  const sampleMessages = [
    '青島みかんを5kg注文したいです',
    '前回のみかんがとても美味しかったです',
    '配送に問題がありました',
    '新商品について教えてください'
  ];

  const customers = [
    { id: 'customer-001', name: '田中さん' },
    { id: 'customer-002', name: '佐藤さん' },
    { id: 'customer-003', name: '山田さん' }
  ];

  const tones = [
    { value: 'friendly' as const, label: 'フレンドリー', icon: '😊' },
    { value: 'professional' as const, label: 'プロフェッショナル', icon: '👔' },
    { value: 'apologetic' as const, label: '謝罪的', icon: '🙏' },
    { value: 'enthusiastic' as const, label: '熱心', icon: '🎉' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Connection Status */}
      <div className={`p-4 rounded-lg ${isConnected === null ? 'bg-yellow-50 border border-yellow-200' : 
                                        isConnected ? 'bg-green-50 border border-green-200' : 
                                                     'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center">
          <span className="text-xl mr-3">
            {isConnected === null ? '🔄' : isConnected ? '✅' : '🔌'}
          </span>
          <div>
            <p className="font-medium">
              {isConnected === null ? '接続確認中...' : 
               isConnected ? 'サーバー接続OK' : 
                           'サーバー接続エラー'}
            </p>
            {!isConnected && isConnected !== null && (
              <p className="text-sm text-red-600 mt-1">
                バックエンドサーバー (localhost:3333) に接続できません
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">💬 顧客メッセージ</h2>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="例：青島みかんを5kg注文したいです..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={4}
          disabled={!isConnected}
        />

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">サンプルメッセージ (タップで入力):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleMessages.map((sample, index) => (
              <button
                key={index}
                onClick={() => setMessage(sample)}
                disabled={!isConnected}
                className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                📝 {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">⚙️ 設定 (任意)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">顧客選択</label>
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={!isConnected}
            >
              <option value="">新規顧客</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.id})
                </option>
              ))}
            </select>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">返信のトーン</label>
            <select
              value={selectedTone || ''}
              onChange={(e) => setSelectedTone(e.target.value as typeof selectedTone || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={!isConnected}
            >
              <option value="">自動選択</option>
              {tones.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.icon} {tone.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerateSuggestions}
          disabled={!message.trim() || loading || !isConnected}
          className="px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-lg rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              生成中...
            </span>
          ) : (
            '🤖 提案生成'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI提案返信文</h2>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {suggestion.tone === 'friendly' ? '😊' :
                       suggestion.tone === 'professional' ? '👔' :
                       suggestion.tone === 'apologetic' ? '🙏' : '🎉'}
                    </span>
                    <span className="font-medium">
                      提案 {index + 1}: {
                        suggestion.tone === 'friendly' ? 'フレンドリー' :
                        suggestion.tone === 'professional' ? 'プロフェッショナル' :
                        suggestion.tone === 'apologetic' ? '謝罪的' : '熱心'
                      }
                    </span>
                  </div>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    信頼度 {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>

                <div className="bg-gray-50 rounded-md p-4 mb-3">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {suggestion.content}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    💡 {suggestion.reasoning}
                  </p>
                  
                  <button
                    onClick={() => handleCopy(suggestion)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      copiedId === suggestion.id
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                    }`}
                  >
                    {copiedId === suggestion.id ? '✅ コピー済み' : '📋 コピー'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      {suggestions.length === 0 && !loading && !error && (
        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 使い方</h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>1.</strong> 顧客からのメッセージを入力（またはサンプルをタップ）</p>
            <p><strong>2.</strong> 必要に応じて顧客IDとトーンを設定</p>
            <p><strong>3.</strong> 「🤖 提案生成」ボタンをタップ</p>
            <p><strong>4.</strong> 気に入った返信文の「📋 コピー」をタップ</p>
            <p><strong>5.</strong> LINE/メール/SMSアプリで貼り付けて送信</p>
          </div>
        </div>
      )}
    </div>
  );
}