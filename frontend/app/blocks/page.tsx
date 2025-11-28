'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface BlockedUser {
  id: number;
  blocked: number;
  blocked_username: string;
  blocked_profile: {
    display_name: string;
    avatar: string | null;
  };
  reason: string;
  created_at: string;
}

export default function BlocksPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await api.get('/api/blog/blocks/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setBlocks(data);
    } catch (error) {
      console.error('ブロック一覧の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockId: number, username: string) => {
    if (!confirm(`${username}さんのブロックを解除しますか？`)) {
      return;
    }

    try {
      await api.delete(`/api/blog/blocks/${blockId}/`);
      alert('ブロックを解除しました');
      fetchBlocks();
    } catch (error) {
      console.error('ブロック解除エラー:', error);
      alert('ブロックの解除に失敗しました');
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
              <Link href="/messages" className="text-gray-700 hover:text-pink-600">
                メッセージ
              </Link>
              <Link href="/blocks" className="text-pink-600 font-semibold">
                ブロック
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-pink-600">
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">ブロックしたユーザー</h2>

        {loading ? (
          <p>読み込み中...</p>
        ) : blocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">ブロックしたユーザーはいません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block) => (
              <div key={block.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {block.blocked_profile?.avatar ? (
                        <img 
                          src={block.blocked_profile.avatar} 
                          alt={block.blocked_profile.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        '🚫'
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {block.blocked_profile?.display_name || '不明なユーザー'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{block.blocked_username}
                      </p>
                      {block.reason && (
                        <p className="text-sm text-gray-500 mt-1">
                          理由: {block.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        ブロック日時: {new Date(block.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(block.id, block.blocked_username)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    ブロック解除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

