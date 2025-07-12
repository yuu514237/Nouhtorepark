# のうトレパーク (Brain Training Park)

子供向けの脳トレーニングゲームアプリです。楽しく遊びながら記憶力、反射神経、論理思考力を鍛えることができます。

## 🎮 ゲーム内容

- **数字タッチ** - 1から9まで順番にタッチ（反射神経・集中力）
- **計算レース** - 60秒で計算問題をたくさん解く（計算力・集中力）
- **論理迷路** - 正しい道を選んでゴール（論理思考力・問題解決能力）

## 🚀 クイックスタート

\`\`\`bash
# 1. 依存関係のインストール
npm install

# 2. 開発サーバーの起動
npm run dev
\`\`\`

ブラウザで `http://localhost:3000` を開いてアプリを確認できます。

## 📱 主な機能

### 子供向け機能
- 3つの脳トレゲーム（数字タッチ、計算レース、論理迷路）
- プロフィール設定（名前・アバター）
- スコア記録とレベルアップシステム
- バッジ・実績システム
- プレイ時間管理とアラート機能
- モチベーション向上システム

### 保護者向け機能（Supabase設定時）
- 詳細な学習進捗分析ダッシュボード
- プレイ時間の制限設定
- スキル分析（記憶力、反射神経、論理思考、集中力）
- 週間・月間レポート
- 複数の子供アカウント管理
- 学習アドバイス機能

## 🔧 Supabase設定（オプション）

保護者ダッシュボードを使用する場合：

1. [Supabase](https://supabase.com)でプロジェクト作成
2. `.env.local`に環境変数を設定：
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`
3. Supabaseで以下のSQLを実行：
   - `scripts/create-tables.sql`
   - `scripts/seed-data.sql`

### オフラインモード
Supabaseを設定しない場合でも、ローカルストレージを使用してゲームデータを保存できます。

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + shadcn/ui
- **チャート**: Recharts
- **認証・DB**: Supabase（オプション）
- **状態管理**: React Hooks + localStorage

## 📁 プロジェクト構造

\`\`\`
├── app/                    # Next.js App Router
│   ├── games/             # ゲームページ
│   │   ├── number-touch/  # 数字タッチゲーム
│   │   ├── calculation-race/ # 計算レースゲーム
│   │   └── logic-maze/    # 論理迷路ゲーム
│   ├── auth/              # 認証ページ
│   ├── parent/            # 保護者ダッシュボード
│   ├── profile/           # プロフィールページ
│   └── achievements/      # 実績ページ
├── components/            # UIコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── MotivationSystem.tsx # モチベーションシステム
│   ├── AnalyticsDashboard.tsx # 分析ダッシュボード
│   └── PlayTimeAlert.tsx # プレイ時間アラート
├── hooks/                # カスタムフック
│   ├── useAuth.ts        # 認証フック
│   ├── useChildProfile.ts # 子供プロフィール管理
│   ├── usePlayTimeManager.ts # プレイ時間管理
│   └── useParentAnalytics.ts # 保護者分析
├── lib/                  # ユーティリティ
│   └── supabase.ts       # Supabase設定
├── types/                # TypeScript型定義
└── scripts/              # データベーススクリプト
\`\`\`

## 🎯 ゲーム詳細

### 数字タッチ
- **目的**: 1から9まで順番にタッチして反射神経と集中力を鍛える
- **難易度**: ★★☆
- **スキル**: 反射神経、集中力、視覚認識

### 計算レース
- **目的**: 60秒間で計算問題を解いて計算力を向上
- **難易度**: ★★★（レベル選択可能）
- **スキル**: 計算力、集中力、処理速度

### 論理迷路
- **目的**: 迷路を解いて論理思考力を育成
- **難易度**: ★★★
- **スキル**: 論理思考、問題解決、空間認識

## 📊 分析機能

### 子供向け
- リアルタイムスコア表示
- レベルアップシステム
- バッジ・実績システム
- プレイ時間管理

### 保護者向け
- 詳細なスキル分析
- 学習進捗レポート
- プレイパターン分析
- 個別学習アドバイス

## 🚀 デプロイ

### Vercel（推奨）
1. Vercelでプロジェクトをインポート
2. 環境変数を設定（Supabase使用時）
3. デプロイ完了

### その他のプラットフォーム
- Netlify
- Railway
- Render

## 🔒 セキュリティ

- Row Level Security (RLS) 対応
- 保護者認証システム
- 子供データの安全な管理
- プライバシー保護

## 🌟 今後の機能予定

- [ ] 音声認識ゲーム
- [ ] マルチプレイヤー機能
- [ ] AI学習アシスタント
- [ ] 詳細レポート機能
- [ ] モバイルアプリ版
- [ ] 多言語対応

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 サポート

- 問題報告: [GitHub Issues](https://github.com/your-username/brain-training-park/issues)
- 機能要望: [GitHub Discussions](https://github.com/your-username/brain-training-park/discussions)
- メール: support@brain-training-park.com

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Supabase](https://supabase.com/) - バックエンドサービス
- [Recharts](https://recharts.org/) - チャートライブラリ
