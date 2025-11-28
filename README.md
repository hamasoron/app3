# 💕 Matching App - app3

Django REST Framework + Next.js(TypeScript) + MySQL で構築されたシンプルなマッチングアプリ

---

## 🎯 プロジェクト概要

このプロジェクトは、**SREエンジニアのポートフォリオ**として開発された、フルスタックのマッチングアプリケーションです。

### 主な機能

- ✅ **ユーザープロフィール管理**
  - プロフィール作成・編集
  - プロフィール画像アップロード
  - 興味・趣味の登録
  
- ✅ **ユーザー認証**
  - JWT認証
  - ユーザー登録・ログイン
  
- ✅ **マッチング機能**
  - ユーザー検索・一覧表示
  - いいね送信機能
  - いいね承認/拒否機能
  - 相互いいね（マッチング）検出
  - マッチング成立通知

- ✅ **メッセージ機能**
  - マッチングしたユーザー同士でメッセージ交換
  - メッセージ履歴表示

---

## 🛠️ 技術スタック

### バックエンド
- **Python 3.11**
- **Django 5.0** - Webフレームワーク
- **Django REST Framework** - REST API構築
- **MySQL 8.0** - データベース
- **JWT** - 認証

### フロントエンド
- **Next.js 14** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **React Markdown** - Markdown表示

### インフラ
- **Docker & Docker Compose** - コンテナ化
- **Nginx** - リバースプロキシ（本番環境）

---

## 📁 プロジェクト構造

```
app3/
├── backend/              # Django REST Framework
│   ├── matching/        # マッチングアプリケーション
│   ├── accounts/        # ユーザー認証・プロフィール
│   ├── config/          # Django設定
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/            # Next.js + TypeScript
│   ├── src/
│   │   ├── app/        # App Router
│   │   ├── components/ # Reactコンポーネント
│   │   └── lib/        # API・ユーティリティ
│   ├── package.json
│   └── Dockerfile
├── docs/                # ドキュメント
├── docker-compose.yml
└── README.md
```

---

## 🚀 クイックスタート

### 前提条件

- Docker Desktop インストール済み
- Git インストール済み

### 起動手順

```bash
# リポジトリをクローン
git clone <repository-url>
cd app3

# Docker Composeで起動
docker-compose up -d --build

# マイグレーション実行
docker-compose exec backend python manage.py migrate

# スーパーユーザー作成（任意）
docker-compose exec backend python manage.py createsuperuser
```

### アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:8000/api/
- **Django管理画面**: http://localhost:8000/admin/
- **API ドキュメント**: http://localhost:8000/api/docs/

---

## 📖 詳細ドキュメント

- [セットアップガイド](./SETUP.md) - 開発環境構築
- [デプロイガイド](./DEPLOYMENT.md) - 本番環境デプロイ
- [API仕様書](./docs/API.md) - REST API仕様
- [マッチング機能ガイド](./docs/MATCHING_FEATURE.md) - マッチング機能の詳細

---

## 🎨 スクリーンショット

（後ほど追加予定）

---

## 🧪 テスト

```bash
# バックエンドテスト
docker-compose exec backend python manage.py test

# フロントエンドテスト
docker-compose exec frontend npm test
```

---

## 📝 開発ロードマップ

### Phase 1: 基本機能実装 ✅
- [x] プロジェクトセットアップ
- [x] Django + DRF + MySQL統合
- [x] Next.js + TypeScript セットアップ
- [x] ユーザー認証（JWT）
- [x] プロフィール管理

### Phase 2: マッチング機能 ✅
- [x] いいね機能
- [x] いいね承認/拒否機能
- [x] マッチング検出
- [x] マッチング成立通知
- [x] メッセージ機能
- [x] プロフィール検索

### Phase 3: SRE機能実装（予定）
- [ ] Redis キャッシング
- [ ] Prometheus メトリクス
- [ ] Grafana 監視ダッシュボード
- [ ] ヘルスチェック
- [ ] 負荷テスト

### Phase 4: 本番環境デプロイ（予定）
- [ ] AWS ECS Fargate
- [ ] Aurora MySQL
- [ ] Terraform（IaC）
- [ ] CI/CD（GitHub Actions）

---

## 🤝 貢献

このプロジェクトは学習・ポートフォリオ目的です。

---

## 📄 ライセンス

MIT License

---

## 👤 作成者

SREエンジニアポートフォリオプロジェクト

---

**Happy Coding! 🚀**

