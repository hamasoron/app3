# 🚀 デプロイガイド

このガイドでは、マッチングアプリをデプロイするための複数の戦略を説明します。

---

## 📊 デプロイオプション

| オプション | コスト | 難易度 | 稼働時間 | 推奨用途 |
|--------|------|-------|---------|----------|
| **Docker Compose（ローカル）** | $0/月 | ⭐ | オンデマンド | 開発・学習 |
| **AWS（本番環境）** | $30-100/月 | ⭐⭐⭐⭐⭐ | 24/7 | 本番運用・AWS学習 |

---

## 🎯 推奨デプロイフロー

```
Phase 1: Docker Compose（ローカル）
  ↓ 基本機能実装・動作確認
Phase 2: AWS ECS + Terraform（本番環境）
  ↓ 本番レベルのインフラ・IaC学習
```

---

## 🐳 オプション1: Docker Compose（ローカル開発）

### 概要

最も基本的な環境。開発・学習に最適。

### アーキテクチャ

```
localhost:3000（フロントエンド - Next.js）
   ↓
localhost:8000（バックエンドAPI - Django REST Framework）
   ↓
localhost:3306（MySQL）

※すべてDockerコンテナで動作
```

### デプロイ手順

#### 1. プロジェクトディレクトリに移動

```bash
# プロジェクトのルートディレクトリに移動
cd {your-project-path}/app3

# 例: Windowsの場合
cd C:\Users\{username}\Desktop\APP3

# 例: macOS/Linuxの場合
cd ~/Desktop/app3
```

#### 2. 起動

```bash
# フォアグラウンドで全てのコンテナをビルドして起動
docker-compose up --build

# バックグラウンドで全てのコンテナをビルドして起動（推奨）
docker-compose up -d --build
```

#### 3. データベースマイグレーション

```bash
# マイグレーションファイルを作成（初回のみ）
docker-compose exec backend python manage.py makemigrations

# マイグレーション実行
docker-compose exec backend python manage.py migrate

# マイグレーション状態を確認
docker-compose exec backend python manage.py showmigrations

# スーパーユーザー作成（管理画面用）
docker-compose exec backend python manage.py createsuperuser
```

**⚠️ 重要: 初回起動時の注意**

もし `blog` アプリのマイグレーションが表示されない場合：

```bash
# migrationsフォルダを作成
docker-compose exec backend mkdir -p blog/migrations
docker-compose exec backend touch blog/migrations/__init__.py

# マイグレーションファイルを作成
docker-compose exec backend python manage.py makemigrations blog

# マイグレーション実行
docker-compose exec backend python manage.py migrate
```

#### 4. 起動確認

```bash
# コンテナの状態を確認
docker-compose ps

# ログを確認（エラーがある場合）
docker-compose logs

# 特定のコンテナのログを確認
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

#### 5. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:8000
- **Django管理画面**: http://localhost:8000/admin
- **API ドキュメント**: http://localhost:8000/api/docs

#### 6. 停止

```bash
# 全てのコンテナを停止（データは保持される）
docker-compose down

# 全てのコンテナを停止 + ボリュームも削除（⚠️ データベースのデータが完全に削除される）
docker-compose down -v
```

### メリット

- ✅ **完全無料**
- ✅ **高速な開発サイクル**
- ✅ **外部依存なし**
- ✅ **本番環境に近い構成**

### デメリット

- ❌ **外部からアクセス不可**
- ❌ **Docker Desktop起動中のみ動作**

---

## ☁️ オプション2: AWS（本番環境・学習用）

AWSのスキルを実証するための本格的なデプロイ。

### アーキテクチャ

```
Route53（DNS）
  ↓
CloudFront（CDN）
  ↓
S3（フロントエンド静的ファイル）
  ↓
ALB（ロードバランサー）
  ↓
ECS Fargate（バックエンドコンテナ）
  ↓
RDS Aurora MySQL
```

### 推定コスト

- **最小構成**: $30-50/月
  - ECS Fargate: $15-20
  - RDS Aurora Serverless: $10-15
  - ALB: $5-8
  - S3/CloudFront: $1-2

- **本番構成**: $100-200/月
  - マルチAZ
  - オートスケーリング
  - バックアップ

### デプロイ手順（概要）

#### 1. ECRにイメージをプッシュ

```bash
# ECRリポジトリを作成
aws ecr create-repository --repository-name app3-backend
aws ecr create-repository --repository-name app3-frontend

# ログイン
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.us-east-1.amazonaws.com

# バックエンドイメージをビルド＆プッシュ
cd backend
docker build -t app3-backend .
docker tag app3-backend:latest {account-id}.dkr.ecr.us-east-1.amazonaws.com/app3-backend:latest
docker push {account-id}.dkr.ecr.us-east-1.amazonaws.com/app3-backend:latest

# フロントエンドイメージをビルド＆プッシュ
cd frontend
docker build -t app3-frontend .
docker tag app3-frontend:latest {account-id}.dkr.ecr.us-east-1.amazonaws.com/app3-frontend:latest
docker push {account-id}.dkr.ecr.us-east-1.amazonaws.com/app3-frontend:latest
```

#### 2. RDS Auroraを作成

```bash
aws rds create-db-cluster \
  --db-cluster-identifier app3-db \
  --engine aurora-mysql \
  --engine-version 8.0.mysql_aurora.3.04.0 \
  --master-username admin \
  --master-user-password <password> \
  --database-name matchingdb
```

#### 3. ECS Fargateでデプロイ

```bash
# ECSクラスターを作成
aws ecs create-cluster --cluster-name app3-cluster

# タスク定義を作成（JSON）
# ECSサービスを作成
# ALBを設定
```

### Terraform を使用（推奨）

Infrastructure as Code でインフラを管理:

```hcl
# main.tf の例
provider "aws" {
  region = "us-east-1"
}

# ECR
resource "aws_ecr_repository" "backend" {
  name = "app3-backend"
}

resource "aws_ecr_repository" "frontend" {
  name = "app3-frontend"
}

# ECS クラスター
resource "aws_ecs_cluster" "main" {
  name = "app3-cluster"
}

# RDS Aurora
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "app3-db"
  engine                  = "aurora-mysql"
  engine_version          = "8.0.mysql_aurora.3.04.0"
  database_name           = "matchingdb"
  master_username         = "admin"
  master_password         = var.db_password
}
```

### メリット

- ✅ **本番環境レベルのインフラ**
- ✅ **AWSスキルの実証**
- ✅ **スケーラブル**
- ✅ **IaC（Terraform）の学習**

### デメリット

- ❌ **コストが高い（$30-100/月）**
- ❌ **設定が複雑**
- ❌ **学習コストが高い**

---

## 📝 デプロイ後のチェックリスト

### 機能確認

- [ ] トップページが表示される
- [ ] ユーザー登録が動作する
- [ ] ログインが動作する
- [ ] プロフィール作成が動作する
- [ ] いいね機能が動作する
- [ ] マッチングが表示される
- [ ] メッセージ送信が動作する

### パフォーマンス

- [ ] 初回ロード時間 < 3秒
- [ ] API レスポンス時間 < 500ms
- [ ] 画像が最適化されている

### セキュリティ

- [ ] HTTPS が有効
- [ ] 環境変数が適切に設定
- [ ] CORS が適切に設定
- [ ] 機密情報が漏れていない
- [ ] JWT認証が動作する

---

## 🐛 トラブルシューティング

### Docker Compose: コンテナが起動しない

```bash
# ログを確認
docker-compose logs

# 特定のコンテナのログ
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# コンテナの状態を確認
docker-compose ps

# 完全にクリーンアップして再起動
docker-compose down -v
docker-compose up -d --build
```

### マイグレーションエラー: Table doesn't exist

**エラー例:**
```
django.db.utils.ProgrammingError: (1146, "Table 'matchingdb.blog_profile' doesn't exist")
```

**原因:** マイグレーションが実行されていない

**解決方法:**

```bash
# マイグレーション状態を確認
docker-compose exec backend python manage.py showmigrations

# blogアプリが表示されない場合
docker-compose exec backend mkdir -p blog/migrations
docker-compose exec backend touch blog/migrations/__init__.py
docker-compose exec backend python manage.py makemigrations blog
docker-compose exec backend python manage.py migrate

# 確認
docker-compose exec backend python manage.py showmigrations blog
```

### AWS: デプロイエラー

```bash
# ECRへのログインエラー
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.us-east-1.amazonaws.com

# ECSタスクが起動しない
# CloudWatch Logsを確認
aws logs tail /ecs/app3-backend --follow

# RDS接続エラー
# セキュリティグループを確認
# ECSタスクとRDSが同じVPC内にあるか確認
```

### CORS エラー

```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-cloudfront-domain.cloudfront.net",  # CloudFront URL
]
```

---

**Good luck with your deployment! 🚀**

