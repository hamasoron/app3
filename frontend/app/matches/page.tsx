'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Match {
  id: number;
  user1_profile: {
    display_name: string;
    username: string;
  };
  user2_profile: {
    display_name: string;
    username: string;
  };
  created_at: string;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchMatches();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/blog/profiles/me/');
      setCurrentUserId(response.data.user.id);
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await api.get('/api/blog/matches/');
      // レスポンスが配列かオブジェクトか確認
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setMatches(data);
    } catch (error) {
      console.error('マッチング一覧の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnmatch = async (matchId: number) => {
    if (!confirm('このマッチングを解除しますか？\nメッセージ履歴も削除されます。')) {
      return;
    }
    
    try {
      await api.delete(`/api/blog/matches/${matchId}/`);
      alert('マッチングを解除しました');
      fetchMatches();
    } catch (error) {
      console.error('マッチング解除エラー:', error);
      alert('マッチングの解除に失敗しました');
    }
  };

  const handleBlock = async (match: Match) => {
    // 相手のユーザーIDを取得
    const otherUserId = match.user1_profile.username === currentUserId 
      ? match.user2_profile.username 
      : match.user1_profile.username;
    
    const reason = prompt('ブロック理由を入力してください（任意）:') || '';
    
    if (!confirm(`${otherUserId}さんをブロックしますか？\nマッチングとメッセージも削除されます。`)) {
      return;
    }
    
    try {
      // 相手のユーザーIDを取得（user1 or user2）
      const blockedUserId = currentUserId === match.user1_profile.user_id 
        ? match.user2_profile.user_id 
        : match.user1_profile.user_id;
      
      await api.post('/api/blog/blocks/', {
        blocked_user: blockedUserId,
        reason: reason
      });
      alert('ユーザーをブロックしました');
      fetchMatches();
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
              <Link href="/matches" className="text-pink-600 font-semibold">
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
        <h2 className="text-2xl font-bold mb-6">マッチング一覧</h2>

        {loading ? (
          <p>読み込み中...</p>
        ) : matches.length === 0 ? (
          <p className="text-gray-600">まだマッチングはありません</p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      💕 {match.user1_profile.display_name} ✕ {match.user2_profile.display_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      マッチング日時: {new Date(match.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/messages?match=${match.id}`}
                      className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                      メッセージ
                    </Link>
                    <button
                      onClick={() => handleUnmatch(match.id)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      title="マッチング解除"
                    >
                      解除
                    </button>
                    <button
                      onClick={() => handleBlock(match)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      title="ブロック"
                    >
                      ブロック
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

