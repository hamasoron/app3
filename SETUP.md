# 🛠️ セットアップガイド

app3マッチングアプリの開発環境セットアップ手順

---

## 📋 前提条件

以下のソフトウェアがインストールされていること:

- **Docker Desktop** (推奨)
  - Windows: https://www.docker.com/products/docker-desktop
  - Mac: https://www.docker.com/products/docker-desktop
  - Linux: https://docs.docker.com/engine/install/

または

- **Python 3.11+**
- **Node.js 20+**
- **MySQL 8.0+**

---

## 🐳 Option 1: Docker Compose（推奨）

### ステップ1: リポジトリをクローン

```bash
git clone <repository-url>
cd app3
```

### ステップ2: 環境変数ファイルの作成

```bash
# .env.exampleをコピー
cp .env.example .env
cp backend/.env.example backend/.env

# 必要に応じて.envを編集
```

### ステップ3: コンテナをビルド・起動

```bash
# 全てのコンテナをビルドして起動
docker-compose up -d --build
```

### ステップ4: データベースマイグレーション

```bash
# マイグレーション実行
docker-compose exec backend python manage.py migrate

# スーパーユーザー作成（管理画面アクセス用）
docker-compose exec backend python manage.py createsuperuser
```

### ステップ5: アクセス確認

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:8000
- **Django管理画面**: http://localhost:8000/admin
- **API ドキュメント**: http://localhost:8000/api/docs

### ステップ6: 停止

```bash
# コンテナ停止
docker-compose down

# コンテナ停止 + ボリューム削除（データベースも削除）
docker-compose down -v
```

---

## 💻 Option 2: ローカル開発環境

### バックエンド（Django）

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

# データベース設定（MySQL）
# .envファイルでDB_HOST=localhostに変更

# マイグレーション
python manage.py migrate

# スーパーユーザー作成
python manage.py createsuperuser

# 開発サーバー起動
python manage.py runserver
```

### フロントエンド（Next.js）

```bash
cd frontend

# 依存関係インストール
npm install

# 環境変数設定
# .envファイルでNEXT_PUBLIC_API_URL=http://localhost:8000

# 開発サーバー起動
npm run dev
```

---

## 🗄️ データベース設定

### MySQL 8.0 セットアップ

```sql
-- データベース作成
CREATE DATABASE matchingdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ユーザー作成
CREATE USER 'matchinguser'@'localhost' IDENTIFIED BY 'matchingpassword';

-- 権限付与
GRANT ALL PRIVILEGES ON matchingdb.* TO 'matchinguser'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🧪 テストデータ投入

```bash
# Django shell起動
docker-compose exec backend python manage.py shell

# または
python manage.py shell
```

```python
from django.contrib.auth.models import User
from blog.models import Profile

# テストユーザー作成
user1 = User.objects.create_user('user1', 'user1@example.com', 'password123')
user2 = User.objects.create_user('user2', 'user2@example.com', 'password123')

# プロフィール作成
Profile.objects.create(
    user=user1,
    display_name='山田太郎',
    age=25,
    gender='male',
    location='東京都',
    bio='よろしくお願いします！',
    interests='映画,旅行,カフェ巡り'
)

Profile.objects.create(
    user=user2,
    display_name='佐藤花子',
    age=23,
    gender='female',
    location='大阪府',
    bio='趣味は読書です。',
    interests='読書,料理,カメラ'
)
```

---

## 🐛 トラブルシューティング

### Docker関連

**エラー: port is already allocated**

```bash
# 既に使用中のポートを確認
# Windows:
netstat -ano | findstr :3000
# Mac/Linux:
lsof -i :3000

# 該当のポートを使用しているプロセスを停止
```

**エラー: Cannot connect to the Docker daemon**

```bash
# Docker Desktopを起動してください
```

### Django関連

**エラー: No module named 'mysqlclient'**

```bash
# Windows: Visual C++ Build Toolsが必要
# または
pip install pymysql
# backend/config/__init__.pyに追加:
import pymysql
pymysql.install_as_MySQLdb()
```

**エラー: (2002, "Can't connect to MySQL server")**

```bash
# MySQLが起動しているか確認
# Docker:
docker-compose ps

# ローカル:
# Windows: サービスマネージャーでMySQLを確認
# Mac: brew services list
# Linux: systemctl status mysql
```

### Next.js関連

**エラー: Cannot find module 'next'**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 開発Tips

### ホットリロード

- **Django**: `runserver`でファイル変更時に自動リロード
- **Next.js**: `npm run dev`でファイル変更時に自動リロード

### ログ確認

```bash
# 全てのコンテナのログ
docker-compose logs

# 特定のコンテナのログ
docker-compose logs backend
docker-compose logs frontend

# ログをリアルタイム表示
docker-compose logs -f backend
```

### データベースリセット

```bash
# データベースをリセット
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

---

## 🚀 次のステップ

セットアップが完了したら:

1. [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイ手順を確認
2. [API ドキュメント](http://localhost:8000/api/docs) - API仕様を確認
3. [Django管理画面](http://localhost:8000/admin) - データを管理

---

**Happy Coding! 🎉**


