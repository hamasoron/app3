# ブロック・マッチング解除機能の実装ガイド

## 📋 概要

マッチングアプリのユーザー安全性と快適性を向上させるため、ブロック機能とマッチング解除機能を実装しました。

## 🎯 実装された機能

### 1. マッチング解除機能
- マッチングを削除
- 関連する相互いいねを削除
- 関連するメッセージも自動削除（カスケード）

### 2. ブロック機能
- ユーザーをブロック
- ブロック時に自動的にマッチングといいねを削除
- ブロックしたユーザーは検索結果に表示されない
- ブロック解除機能

## 🛠️ 実装内容

### バックエンド

#### 新規モデル: Block

```python
class Block(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocking')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=200, blank=True)
```

#### 新規APIエンドポイント

**ブロック関連:**
```
GET  /api/blog/blocks/              # ブロック一覧
POST /api/blog/blocks/              # ユーザーをブロック
DELETE /api/blog/blocks/{id}/       # ブロック解除
```

**マッチング関連:**
```
DELETE /api/blog/matches/{id}/      # マッチング解除（追加）
```

#### BlockViewSet

```python
class BlockViewSet(viewsets.ModelViewSet):
    def create(self, request):
        # ブロック作成
        # マッチング削除
        # いいね削除
    
    def destroy(self, request, pk):
        # ブロック解除
```

#### MatchViewSet (更新)

```python
class MatchViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'delete']  # 削除メソッド追加
    
    def destroy(self, request, pk):
        # マッチング削除
        # 相互いいね削除
        # メッセージは自動削除（カスケード）
```

### フロントエンド

#### 新規ページ: ブロック一覧 (`/blocks`)

**ファイル**: `frontend/app/blocks/page.tsx`

**機能**:
- ブロックしたユーザー一覧表示
- ブロック解除ボタン
- ブロック理由の表示

#### メッセージページの改善 (`/messages`)

**追加機能**:
- メニューボタン（⋮）
- マッチング解除オプション
- ブロックへのリンク

#### マッチング一覧ページの改善 (`/matches`)

**追加機能**:
- 各マッチングに「解除」ボタン
- 各マッチングに「ブロック」ボタン
- ブロック理由入力プロンプト

## 🔄 データフロー

### マッチング解除

```
[ユーザー] 
  ↓
1. 解除ボタンをクリック (メッセージページ or マッチング一覧)
  ↓
2. 確認ダイアログ
  ↓
3. DELETE /api/blog/matches/{id}/
  ↓
[バックエンド]
  - マッチングレコード削除
  - 相互いいね削除
  - メッセージ削除（カスケード）
  ↓
4. マッチング一覧ページへ遷移
```

### ブロック

```
[ユーザー]
  ↓
1. ブロックボタンをクリック (マッチング一覧)
  ↓
2. ブロック理由入力（任意）
  ↓
3. 確認ダイアログ
  ↓
4. POST /api/blog/blocks/
  ↓
[バックエンド]
  - Blockレコード作成
  - マッチング削除
  - いいね削除
  ↓
5. マッチング一覧を更新
```

### ブロック解除

```
[ユーザー]
  ↓
1. ブロック一覧ページ (/blocks)
  ↓
2. ブロック解除ボタンをクリック
  ↓
3. 確認ダイアログ
  ↓
4. DELETE /api/blog/blocks/{id}/
  ↓
[バックエンド]
  - Blockレコード削除
  ↓
5. ブロック一覧を更新
```

## 🎨 UI/UX

### メッセージページのメニュー

```
┌─────────────────────┐
│ メッセージ    ⋮ メニュー │
└─────────────────────┘
              ↓ クリック
    ┌───────────────────┐
    │ マッチング解除        │
    │ ブロック（一覧から）   │
    └───────────────────┘
```

### マッチング一覧の管理ボタン

```
┌──────────────────────────────────┐
│ 💕 田中太郎 ✕ 佐藤花子              │
│ マッチング日時: 2025/11/28         │
│                                  │
│ [メッセージ] [解除] [ブロック]     │
└──────────────────────────────────┘
```

### ブロック一覧ページ

```
┌──────────────────────────────────┐
│ 🚫 田中太郎                        │
│ @tanaka                          │
│ 理由: 不適切なメッセージ            │
│ ブロック日時: 2025/11/28           │
│                                  │
│              [ブロック解除]        │
└──────────────────────────────────┘
```

## 🔒 セキュリティ

### 権限チェック

**マッチング解除:**
```python
if match.user1 != request.user and match.user2 != request.user:
    return Response({'error': 'You are not part of this match'}, status=403)
```

**ブロック:**
```python
# 自分自身はブロックできない
if blocked_user == request.user:
    return Response({'error': 'Cannot block yourself'}, status=400)
```

**ブロック解除:**
```python
# 自分がブロックしたものだけ解除可能
if block.blocker != request.user:
    return Response({'error': 'You can only unblock users you have blocked'}, status=403)
```

### データ整合性

- `unique_together` 制約で重複ブロック防止
- カスケード削除でデータの一貫性を保証
- トランザクション処理で原子性を確保

## 📊 データベース設計

### Blockテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー |
| blocker_id | INTEGER | ブロックした人（FK to User） |
| blocked_id | INTEGER | ブロックされた人（FK to User） |
| reason | VARCHAR(200) | ブロック理由（任意） |
| created_at | DATETIME | ブロック日時 |

**制約:**
- `unique_together`: (blocker, blocked)
- **Index**: (blocker, blocked), created_at

### 関連テーブルへの影響

**Match テーブル:**
- ON DELETE CASCADE → メッセージも自動削除

**Like テーブル:**
- ブロック時に明示的に削除

## 🚀 デプロイ前の手順

### 1. マイグレーションの作成と実行

```bash
# マイグレーションファイル作成
docker compose exec backend python manage.py makemigrations

# マイグレーション実行
docker compose exec backend python manage.py migrate
```

### 2. バックエンド再起動

```bash
docker compose restart backend
```

### 3. フロントエンド確認

ブラウザで以下のページにアクセスして動作確認：
- http://localhost:3000/matches （マッチング一覧）
- http://localhost:3000/messages?match=1 （メッセージ）
- http://localhost:3000/blocks （ブロック一覧）

## 🧪 テスト項目

### マッチング解除
- [ ] メッセージページから解除できる
- [ ] マッチング一覧ページから解除できる
- [ ] 解除時に確認ダイアログが表示される
- [ ] 解除後、マッチング一覧から消える
- [ ] 相互いいねも削除される
- [ ] メッセージも削除される

### ブロック
- [ ] マッチング一覧からブロックできる
- [ ] ブロック理由を入力できる（任意）
- [ ] ブロック時にマッチングが削除される
- [ ] ブロックしたユーザーが検索に表示されない
- [ ] 自分自身はブロックできない

### ブロック解除
- [ ] ブロック一覧ページでブロック解除できる
- [ ] 解除時に確認ダイアログが表示される
- [ ] 解除後、ブロック一覧から消える

### UI/UX
- [ ] ボタンのホバーエフェクト
- [ ] 確認ダイアログの表示
- [ ] エラーメッセージの表示
- [ ] 成功メッセージの表示

## 📝 今後の改善案

### 短期
1. ブロックされた側への通知なし（現在の実装）
2. ブロック理由のプリセット選択肢
3. ブロック統計（管理者用）

### 中期
1. 通報機能の追加
2. 自動ブロック機能（複数の通報）
3. ブロック解除の履歴

### 長期
1. AIによる不適切なメッセージの自動検出
2. ユーザー行動分析
3. コミュニティガイドライン違反の自動検出

## 🐛 既知の制限事項

1. ブロックされた側は通知を受け取らない
2. ブロック前のメッセージ履歴は完全に削除される
3. ブロック解除後も、以前のマッチングは復元されない

## 📚 関連ファイル

### バックエンド
- `backend/blog/models.py` - Blockモデル追加
- `backend/blog/views.py` - BlockViewSet, MatchViewSet更新
- `backend/blog/serializers.py` - BlockSerializer追加
- `backend/blog/urls.py` - blocksルート追加
- `backend/blog/admin.py` - BlockAdmin追加

### フロントエンド
- `frontend/app/blocks/page.tsx` - ブロック一覧ページ（新規）
- `frontend/app/matches/page.tsx` - ブロック・解除ボタン追加
- `frontend/app/messages/page.tsx` - メニュー追加

## 💡 使い方

### ユーザーをブロックする

1. マッチング一覧ページへ移動
2. ブロックしたいユーザーの「ブロック」ボタンをクリック
3. ブロック理由を入力（任意）
4. 確認ダイアログで「OK」をクリック

### マッチングを解除する

1. メッセージページまたはマッチング一覧ページへ移動
2. 「解除」ボタンまたはメニューから「マッチング解除」を選択
3. 確認ダイアログで「OK」をクリック

### ブロックを解除する

1. ブロック一覧ページ（`/blocks`）へ移動
2. ブロック解除したいユーザーの「ブロック解除」ボタンをクリック
3. 確認ダイアログで「OK」をクリック

---

**実装完了日**: 2025年11月28日
**バージョン**: v1.1.0

