'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Profile } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    receivedLikes: 0,
    sentLikes: 0,
    matches: 0,
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/blog/profiles/me/');
      setProfile(response.data);
    } catch (error) {
      console.error('プロフィールの取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [receivedRes, sentRes, matchesRes] = await Promise.all([
        api.get('/api/blog/likes/received/'),
        api.get('/api/blog/likes/sent/'),
        api.get('/api/blog/matches/')
      ]);
      
      const receivedData = Array.isArray(receivedRes.data) 
        ? receivedRes.data 
        : receivedRes.data.results || [];
      const sentData = Array.isArray(sentRes.data) 
        ? sentRes.data 
        : sentRes.data.results || [];
      const matchesData = Array.isArray(matchesRes.data) 
        ? matchesRes.data 
        : matchesRes.data.results || [];
      
      setStats({
        receivedLikes: receivedData.length,
        sentLikes: sentData.length,
        matches: matchesData.length,
      });
    } catch (error) {
      console.error('統計情報の取得に失敗しました', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

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
              <Link href="/messages" className="text-gray-700 hover:text-pink-600">
                メッセージ
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-pink-600"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">ダッシュボード</h2>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link href="/likes" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-pink-100 rounded-full p-3">
                  <span className="text-2xl">❤️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">受信したいいね</p>
                  <p className="text-2xl font-bold text-pink-600">{stats.receivedLikes}</p>
                </div>
              </div>
            </Link>

            <Link href="/likes" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <span className="text-2xl">💌</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">送信したいいね</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sentLikes}</p>
                </div>
              </div>
            </Link>

            <Link href="/matches" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                  <span className="text-2xl">💕</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">マッチング数</p>
                  <p className="text-2xl font-bold text-green-600">{stats.matches}</p>
                </div>
              </div>
            </Link>
          </div>

          {profile ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  マイプロフィール
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">表示名</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.display_name}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">ユーザー名</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.username}
                    </dd>
                  </div>
                  {profile.age && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">年齢</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profile.age}歳
                      </dd>
                    </div>
                  )}
                  {profile.location && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">居住地</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profile.location}
                      </dd>
                    </div>
                  )}
                  {profile.bio && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">自己紹介</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profile.bio}
                      </dd>
                    </div>
                  )}
                  {profile.interests_list && profile.interests_list.length > 0 && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">興味・趣味</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex flex-wrap gap-2">
                          {profile.interests_list.map((interest, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <Link
                  href="/profile/edit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  プロフィールを編集
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  プロフィールを作成してください
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>マッチング機能を利用するには、プロフィールの作成が必要です。</p>
                </div>
                <div className="mt-5">
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                  >
                    プロフィールを作成
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

