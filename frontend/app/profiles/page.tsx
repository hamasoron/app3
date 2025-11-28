'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Profile {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  age: number | null;
  location: string;
  bio: string;
  avatar: string | null;
}

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchNotification, setMatchNotification] = useState<{show: boolean, matchId: number | null}>({show: false, matchId: null});

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async (search?: string) => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      // discoverエンドポイントを使用して、既にいいねしたユーザーを除外
      const response = await api.get(`/api/blog/profiles/discover/${params}`);
      // レスポンスが配列かオブジェクトか確認
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setProfiles(data);
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchProfiles(searchTerm);
  };

  const handleLike = async (userId: number) => {
    try {
      const response = await api.post('/api/blog/likes/', { to_user: userId });
      
      // マッチングが成立したかチェック
      if (response.data.matched) {
        setMatchNotification({show: true, matchId: response.data.match_id});
        // プロフィールリストから削除
        setProfiles(profiles.filter(p => p.user_id !== userId));
      } else {
        alert('いいねを送信しました！');
        // プロフィールリストから削除
        setProfiles(profiles.filter(p => p.user_id !== userId));
      }
    } catch (error: any) {
      if (error.response?.data?.message === 'Already liked') {
        alert('既にいいね済みです');
        // プロフィールリストから削除
        setProfiles(profiles.filter(p => p.user_id !== userId));
      } else {
        alert('いいねの送信に失敗しました');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* マッチング成立通知モーダル */}
      {matchNotification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-pink-600 mb-4">
              マッチング成立！
            </h2>
            <p className="text-gray-600 mb-6">
              おめでとうございます！<br />
              相手もあなたにいいねしました。
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setMatchNotification({show: false, matchId: null})}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                閉じる
              </button>
              <button
                onClick={() => router.push(`/messages?match=${matchNotification.matchId}`)}
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
              >
                メッセージを送る
              </button>
            </div>
          </div>
        </div>
      )}
      
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
              <Link href="/profiles" className="text-pink-600 font-semibold">
                ユーザー検索
              </Link>
              <Link href="/likes" className="text-gray-700 hover:text-pink-600">
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
        <h2 className="text-2xl font-bold mb-6">ユーザー検索</h2>

        {/* 検索ボックス */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="名前、趣味、居住地で検索..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              検索
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setLoading(true);
                fetchProfiles();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              クリア
            </button>
          </div>
        </form>

        {loading ? (
          <p>読み込み中...</p>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">ユーザーが見つかりませんでした</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setLoading(true);
                fetchProfiles();
              }}
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              全てのユーザーを表示
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-4xl mb-3">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{profile.display_name}</h3>
                  <p className="text-gray-600 text-sm mb-2">@{profile.username}</p>
                </div>
                {profile.age && <p className="text-gray-600 text-sm">🎂 {profile.age}歳</p>}
                {profile.location && <p className="text-gray-600 text-sm">📍 {profile.location}</p>}
                {profile.bio && <p className="text-gray-700 mt-3 text-sm">{profile.bio}</p>}
                <button
                  onClick={() => handleLike(profile.user_id)}
                  className="mt-4 w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
                >
                  ❤️ いいね
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

