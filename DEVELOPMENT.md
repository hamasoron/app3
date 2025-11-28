# 💻 開発ガイド

このドキュメントでは、プロジェクトの開発ワークフローを説明します。

## 🌿 Gitワークフロー

### ブランチ戦略

```
main（本番環境）
  ↓
  ├─ feat/user-profile
  ├─ feat/matching-system
  └─ feat/message-feature
```

### ブランチ命名規則(GitHub Flow)

- `feat/*` - 新機能（例: `feat/add-like-feature`）
- `fix/*` - バグ修正（例: `fix/login-error`）
- `docs/*` - ドキュメント更新（例: `docs/update-readme`）
- `style/*` - コードスタイル（例: `style/format-code`）
- `refactor/*` - リファクタリング（例: `refactor/api-structure`）
- `perf/*` - パフォーマンス改善（例: `perf/optimize-query`）
- `test/*` - テスト追加（例: `test/add-unit-tests`）
- `chore/*` - 雑務（例: `chore/update-dependencies`）

**重要:** Conventional Commits標準に準拠
- `feat` = feature の短縮形
- コミットメッセージと一貫性を保つ

## 📝 コミットメッセージ規約(Conventional Commits)

```bash
# フォーマット
<type>: <簡潔な説明>

# 例
feat: add user profile edit functionality
fix: resolve JWT authentication bug
docs: update API documentation
style: format code with prettier
refactor: restructure matching algorithm
test: add unit tests for profile service
chore: update Django to 5.0
```

### コミットタイプ

- `feat` - 新機能
- `fix` - バグ修正
- `docs` - ドキュメントのみの変更
- `style` - コードスタイル（フォーマット、コード変更なし）
- `refactor` - リファクタリング
- `test` - テストの追加
- `chore` - ビルド、設定、依存関係

## 🚀 開発ワークフロー

### 1. 新機能の開発を開始

```bash
# main から feature ブランチを作成
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### 2. 開発環境を起動

```bash
# Docker Composeで起動
docker compose up -d --build

# ログを確認
docker compose logs -f backend
```

### 3. 変更を加える

```bash
# コードを変更
# ブラウザで動作確認: http://localhost:3000

# 変更をステージング
git add .

# 説明的なメッセージでコミット
git commit -m "feat: add your feature description"
```

### 4. プッシュしてPull Requestを作成

```bash
# リモートにプッシュ
git push origin feat/your-feature-name

# GitHubでPull Requestを作成
```

### 5. mainにマージ

```bash
# 承認後、mainにマージ
git checkout main
git merge feat/your-feature-name
git push origin main

# または、GitHubのマージボタンを使用
```

### 6. ブランチのクリーンアップ

```bash
# ローカルブランチを削除
git branch -d feat/your-feature-name

# リモートブランチを削除
git push origin --delete feat/your-feature-name
```

## 🛠️ 開発環境のセットアップ

### Docker Composeを使用（推奨）

```bash
# プロジェクトルートに移動
cd APP3

# コンテナをビルドして起動
docker compose up -d --build

# マイグレーション実行
docker compose exec backend python manage.py migrate

# スーパーユーザー作成
docker compose exec backend python manage.py createsuperuser

# アクセス
# フロントエンド: http://localhost:3000
# バックエンド: http://localhost:8000
# 管理画面: http://localhost:8000/admin
```

### ローカル環境で直接実行

#### バックエンド（Django）

```bash
cd backend

# 仮想環境作成
python -m venv venv

# 仮想環境有効化
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 依存関係インストール
pip install -r requirements.txt

# マイグレーション
python manage.py migrate

# スーパーユーザー作成
python manage.py createsuperuser

# 開発サーバー起動
python manage.py runserver
```

#### フロントエンド（Next.js）

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## 🔄 定期的なタスク

### 依存関係の更新

```bash
# バックエンド
cd backend
pip list --outdated
pip install -U <package-name>
pip freeze > requirements.txt

# フロントエンド
cd frontend
npm outdated
npm update
```

### データベースのリセット

```bash
# Docker Composeの場合
docker compose down -v
docker compose up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser

# ローカル環境の場合
cd backend
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### テストデータの投入

```bash
# Django shellで実行
docker compose exec backend python manage.py shell
```

```python
from django.contrib.auth.models import User
from blog.models import Profile

# テストユーザー作成
user1 = User.objects.create_user('testuser1', 'test1@example.com', 'password123')
user2 = User.objects.create_user('testuser2', 'test2@example.com', 'password123')

# プロフィール作成
Profile.objects.create(
    user=user1,
    display_name='テストユーザー1',
    age=25,
    gender='male',
    location='東京都',
    bio='テストユーザーです',
    interests='映画,音楽,旅行'
)

Profile.objects.create(
    user=user2,
    display_name='テストユーザー2',
    age=23,
    gender='female',
    location='大阪府',
    bio='よろしくお願いします',
    interests='読書,カフェ,写真'
)
```

## 🐛 デバッグ

### バックエンドのログ確認

```bash
# Docker Composeの場合
docker compose logs -f backend

# ローカルの場合
# コンソールに出力される
```

### フロントエンドのログ確認

```bash
# Docker Composeの場合
docker compose logs -f frontend

# ローカルの場合
# ブラウザのDevToolsで確認
```

### データベースの確認

```bash
# MySQLに接続
docker compose exec db mysql -u matchinguser -p matchingdb

# テーブル一覧
SHOW TABLES;

# データ確認
SELECT * FROM blog_profile;
SELECT * FROM blog_like;
SELECT * FROM blog_match;
```

## 🔧 トラブルシューティング

### ポートが既に使用されている

```bash
# Windows PowerShell
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# プロセスを終了
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
lsof -i :8000

# プロセスを終了
kill -9 <PID>
```

### Docker コンテナが起動しない

```bash
# ログを確認
docker compose logs

# コンテナの状態を確認
docker compose ps

# 完全にクリーンアップ
docker compose down -v
docker system prune -a

# 再起動
docker compose up -d --build
```

### マイグレーションエラー

```bash
# マイグレーションファイルを削除
# backend/blog/migrations/ 内の __init__.py 以外を削除

# データベースをリセット
docker compose down -v
docker compose up -d

# 新しいマイグレーションを作成
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

### CORS エラー

```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## 📦 新しい機能の追加

### バックエンド（Django）

1. **モデルを作成**

```python
# backend/blog/models.py
class NewModel(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
```

2. **マイグレーションを作成**

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

3. **シリアライザーを作成**

```python
# backend/blog/serializers.py
class NewModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewModel
        fields = '__all__'
```

4. **ビューを作成**

```python
# backend/blog/views.py
class NewModelViewSet(viewsets.ModelViewSet):
    queryset = NewModel.objects.all()
    serializer_class = NewModelSerializer
```

5. **URLを登録**

```python
# backend/blog/urls.py
router.register(r'new-models', NewModelViewSet)
```

### フロントエンド（Next.js）

1. **型定義を追加**

```typescript
// frontend/types/index.ts
export interface NewModel {
  id: number;
  name: string;
  created_at: string;
}
```

2. **ページを作成**

```typescript
// frontend/app/new-feature/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function NewFeaturePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await api.get('/api/blog/new-models/');
    setData(response.data);
  };

  return (
    <div>
      {/* コンポーネント */}
    </div>
  );
}
```

## 💡 開発のベストプラクティス

### コード品質

1. **シンプルに保つ** - 複雑すぎるコードは避ける
2. **DRY原則** - 同じコードを繰り返さない
3. **命名規則** - 分かりやすい変数名・関数名
4. **コメント** - 「なぜ」を説明する（「何を」ではなく）

### Django

1. **モデル** - 適切なバリデーションを設定
2. **クエリ最適化** - N+1問題に注意
3. **セキュリティ** - CSRF、XSS対策を実装
4. **環境変数** - 機密情報は `.env` に保存

### Next.js / React

1. **useEffect** - 依存配列を適切に設定
2. **状態管理** - 必要最小限の状態を保持
3. **エラーハンドリング** - try-catchで適切にエラー処理
4. **型安全性** - TypeScriptの型を活用

### Git の使い方

1. **小さいコミット** - 1つの変更は1つのコミット
2. **頻繁にコミット** - 作業を小刻みに保存
3. **プッシュ前に確認** - `git status` と `git diff` を確認
4. **ブランチを使う** - main に直接コミットしない

## 📚 参考リンク

### Django
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Best Practices](https://django-best-practices.readthedocs.io/)

### Next.js / React
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

### Git
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Happy Coding! 🚀**

