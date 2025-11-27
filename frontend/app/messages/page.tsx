'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Message {
  id: number;
  sender_username: string;
  sender_display_name: string;
  content: string;
  created_at: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchMessages();
    }
  }, [matchId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/blog/messages/?match=${matchId}`);
      // レスポンスが配列かオブジェクトか確認
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setMessages(data);
    } catch (error) {
      console.error('メッセージの取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId) return;

    try {
      await api.post('/api/blog/messages/', {
        match: matchId,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      alert('メッセージの送信に失敗しました');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-pink-600">💕 Matching App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-pink-600">
                ダッシュボード
              </Link>
              <Link href="/profiles" className="text-gray-700 hover:text-pink-600">
                ユーザー検索
              </Link>
              <Link href="/matches" className="text-gray-700 hover:text-pink-600">
                マッチング
              </Link>
              <Link href="/messages" className="text-pink-600 font-semibold">
                メッセージ
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-pink-600">
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">メッセージ</h2>

        {!matchId ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              マッチング一覧からメッセージを送信したい相手を選択してください
            </p>
            <Link
              href="/matches"
              className="inline-block mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              マッチング一覧へ
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b max-h-96 overflow-y-auto">
              {loading ? (
                <p>読み込み中...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-600">まだメッセージはありません</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border-b pb-4">
                      <p className="font-semibold text-sm text-gray-700">
                        {message.sender_display_name}
                      </p>
                      <p className="text-gray-900 mt-1">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                >
                  送信
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

