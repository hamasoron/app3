'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Message {
  id: number;
  sender: number;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    if (matchId) {
      fetchMessages();
    }
  }, [matchId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/blog/profiles/me/');
      setCurrentUserId(response.data.user.id);
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/blog/messages/by_match/?match_id=${matchId}`);
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
        match: parseInt(matchId),
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      console.error('メッセージ送信エラー:', error.response?.data || error);
      alert(`メッセージの送信に失敗しました: ${error.response?.data?.error || '不明なエラー'}`);
    }
  };

  const handleUnmatch = async () => {
    if (!confirm('このマッチングを解除しますか？\nメッセージ履歴も削除されます。')) {
      return;
    }
    
    try {
      await api.delete(`/api/blog/matches/${matchId}/`);
      alert('マッチングを解除しました');
      router.push('/matches');
    } catch (error) {
      console.error('マッチング解除エラー:', error);
      alert('マッチングの解除に失敗しました');
    }
  };

  const handleBlock = async () => {
    if (!confirm('このユーザーをブロックしますか？\nマッチングとメッセージも削除されます。')) {
      return;
    }
    
    // 相手のユーザーIDを取得するために、matchの情報が必要
    // ここでは簡易的に実装
    const reason = prompt('ブロック理由（任意）:') || '';
    
    try {
      // マッチング情報から相手のユーザーIDを取得する必要がある
      // 一旦、マッチングページから実行するようにする
      alert('ブロック機能は現在開発中です。マッチング一覧から実行してください。');
    } catch (error) {
      console.error('ブロックエラー:', error);
      alert('ブロックに失敗しました');
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
              <Link href="/likes" className="text-gray-700 hover:text-pink-600">
                いいね
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">メッセージ</h2>
          {matchId && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                ⋮ メニュー
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleUnmatch();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    マッチング解除
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push(`/matches`);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    ブロック（マッチング一覧から）
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
            <div className="p-6 border-b max-h-[500px] overflow-y-auto">
              {loading ? (
                <p>読み込み中...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-600">まだメッセージはありません</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMyMessage = message.sender === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-3 ${
                            isMyMessage
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {!isMyMessage && (
                            <p className="font-semibold text-xs mb-1 text-gray-600">
                              {message.sender_display_name}
                            </p>
                          )}
                          <p className={`break-words ${isMyMessage ? 'text-white' : 'text-gray-900'}`}>
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isMyMessage ? 'text-pink-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
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

