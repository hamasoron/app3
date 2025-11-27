import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          💕 Matching App
        </h1>
        <p className="text-center text-lg mb-4">
          Django REST Framework + Next.js + MySQL
        </p>
        
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/login"
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            新規登録
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">👤 Profile</h2>
            <p className="text-gray-600">
              ユーザープロフィール管理
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">❤️ Matching</h2>
            <p className="text-gray-600">
              いいね・マッチング機能
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">💬 Message</h2>
            <p className="text-gray-600">
              メッセージ交換機能
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            SREエンジニア ポートフォリオプロジェクト
          </p>
        </div>
      </div>
    </main>
  )
}


