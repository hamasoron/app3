'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Like } from '@/types';

export default function LikesPage() {
  const router = useRouter();
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([]);
  const [sentLikes, setSentLikes] = useState<Like[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/api/blog/likes/received/'),
        api.get('/api/blog/likes/sent/')
      ]);
      
      const receivedData = Array.isArray(receivedRes.data) 
        ? receivedRes.data 
        : receivedRes.data.results || [];
      const sentData = Array.isArray(sentRes.data) 
        ? sentRes.data 
        : sentRes.data.results || [];
      
      setReceivedLikes(receivedData);
      setSentLikes(sentData);
    } catch (error) {
      console.error('いいね一覧の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (likeId: number) => {
    try {
      const response = await api.post(`/api/blog/likes/${likeId}/accept/`);
      
      if (response.data.matched) {
        alert('🎉 マッチングが成立しました！');
        // マッチング一覧ページに遷移
        router.push('/matches');
      }
    } catch (error) {
      console.error('いいねの承認に失敗しました', error);
      alert('いいねの承認に失敗しました');
    }
  };

  const handleReject = async (likeId: number) => {
    if (!confirm('このいいねを拒否しますか？')) {
      return;
    }
    
    try {
      await api.post(`/api/blog/likes/${likeId}/reject/`);
      // リストから削除
      setReceivedLikes(receivedLikes.filter(like => like.id !== likeId));
      alert('いいねを拒否しました');
    } catch (error) {
      console.error('いいねの拒否に失敗しました', error);
      alert('いいねの拒否に失敗しました');
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
              <Link href="/likes" className="text-pink-600 font-semibold">
                いいね
              </Link>
              <Link href="/matches" className="text-gray-700 hover:text-pink-600">
                マッチング
              </Link>
              <Link href="/messages" className="text-gray-700 hover:text-pink-600">
                メッセージ
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-pink-600">
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">いいね管理</h2>

        {/* タブ */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              受信したいいね
              {receivedLikes.length > 0 && (
                <span className="ml-2 bg-pink-100 text-pink-600 py-0.5 px-2 rounded-full text-xs">
                  {receivedLikes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              送信したいいね
              {sentLikes.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {sentLikes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : activeTab === 'received' ? (
          // 受信したいいね
          receivedLikes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">まだいいねを受信していません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedLikes.map((like) => (
                <div key={like.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
                        {like.from_user_profile?.avatar ? (
                          <img 
                            src={like.from_user_profile.avatar} 
                            alt={like.from_user_profile.display_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {like.from_user_profile?.display_name || '不明なユーザー'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          @{like.from_user_profile?.username || 'unknown'}
                        </p>
                        {like.from_user_profile?.age && (
                          <p className="text-sm text-gray-600">
                            {like.from_user_profile.age}歳
                          </p>
                        )}
                        {like.from_user_profile?.location && (
                          <p className="text-sm text-gray-600">
                            📍 {like.from_user_profile.location}
                          </p>
                        )}
                        {like.from_user_profile?.bio && (
                          <p className="text-sm text-gray-700 mt-2">
                            {like.from_user_profile.bio}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(like.created_at).toLocaleDateString('ja-JP')} {new Date(like.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleAccept(like.id)}
                        className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                      >
                        ❤️ 承認する
                      </button>
                      <button
                        onClick={() => handleReject(like.id)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        ✕ 拒否する
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // 送信したいいね
          sentLikes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">まだいいねを送信していません</p>
              <Link
                href="/profiles"
                className="mt-4 inline-block px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                ユーザーを探す
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sentLikes.map((like) => (
                <div key={like.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
                        {like.to_user_profile?.avatar ? (
                          <img 
                            src={like.to_user_profile.avatar} 
                            alt={like.to_user_profile.display_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {like.to_user_profile?.display_name || '不明なユーザー'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          @{like.to_user_profile?.username || 'unknown'}
                        </p>
                        {like.to_user_profile?.age && (
                          <p className="text-sm text-gray-600">
                            {like.to_user_profile.age}歳
                          </p>
                        )}
                        {like.to_user_profile?.location && (
                          <p className="text-sm text-gray-600">
                            📍 {like.to_user_profile.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(like.created_at).toLocaleDateString('ja-JP')} に送信
                        </p>
                      </div>
                    </div>
                    <div>
                      {like.is_mutual ? (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded font-semibold">
                          ✓ マッチング済み
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded">
                          ⏳ 返信待ち
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

