# Ollama Newest Models RSS Generator

[Ollama Library (sort=newest)](https://ollama.com/library?sort=newest) から最新のモデル情報をスクレイピングし、**RSS 2.0 形式** (`/feed.rss`) で配信する GitHub Pages アプリケーションです。

GitHub Actions により**1日2回（日本時間の朝6時・夜6時）**自動更新されます。

---

## 🌟 特徴

- **RSS 2.0 準拠**: RFC 822 日付形式 (`pubDate`)、Atom 自己参照リンク、GUID を備えた標準的な RSS 2.0 フィードを生成。
- **リッチなメタデータ**: 各モデルの説明文だけでなく、タグ（`vision`, `tools`, `thinking` 等）、パラメータサイズ（`40b`, `9b` 等）、Pulls数、Tags数、正確な更新日時を `<description>` に網羅。
- **Webプレビュー画面付き**: GitHub Pages ルート (`/`) に、モデル一覧・検索フィルタ・RSS登録URLコピーボタンを備えたモダンなダークテーマ UI を自動配置。
- **全自動デプロイ**: GitHub Actions を利用して、追加のブランチ（gh-pages）を汚すことなく GitHub Pages へ直接デプロイ。

---

## 🚀 GitHub Pages 公開設定

本リポジトリを GitHub にプッシュした後、以下の設定を行ってください：

1. リポジトリの **Settings** タブを開きます。
2. 左メニューの **Pages** を選択します。
3. **Build and deployment** > **Source** を **`GitHub Actions`** に設定します。
4. `main` ブランチにプッシュするか、**Actions** タブから `Update and Deploy RSS Feed` ワークフローを手動実行（Run workflow）してください。
5. デプロイ完了後、以下の URL でアクセスできるようになります：
   - Web画面: `https://<owner>.github.io/<repo>/`
   - RSSフィード: `https://<owner>.github.io/<repo>/feed.rss`

---

## ⏰ スケジュール

- **朝 06:00 JST** (UTC 21:00)
- **夜 18:00 JST** (UTC 09:00)
- （GitHub Actions の `workflow_dispatch` により、いつでも手動実行も可能です）

---

## 💻 ローカル開発・実行

### 必要環境
- Node.js 18+
- npm

### インストール
```bash
npm install
```

### 生成スクリプトの実行
```bash
npm run generate
```
実行後、`dist/` フォルダに以下のファイルが生成されます：
- `dist/feed.rss` (RSS 2.0 XML)
- `dist/index.html` (Webプレビュー画面)
- `dist/feed.xml` / `dist/rss.xml` (互換用エイリアス)

### サンプルHTMLを使ったパーステスト
```bash
npm run test:sample
```

---

## 📁 ディレクトリ構成

```text
├── .github/workflows/deploy.yml # GitHub Actions 定期実行＆Pagesデプロイ
├── src/
│   ├── index.ts                # メインエントリーポイント
│   ├── scraper.ts              # Ollama スクレイピング＆HTMLパース
│   ├── rss.ts                  # RSS 2.0 フィード生成モジュール
│   ├── html.ts                 # プレビュー用 index.html 生成モジュール
│   └── types.ts                # 型定義
├── test/
│   └── test-local.ts           # サンプルHTMLを用いたテストスクリプト
├── dist/                       # ビルド成果物（GitHub Pages 公開対象）
├── package.json
├── tsconfig.json
└── 要件.md                      # プロジェクト要件書
```
