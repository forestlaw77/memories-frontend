# 📡 API Fetcher 抽象層

このディレクトリは、Tauri 環境とブラウザ環境の違いを吸収するための通信抽象層です。
共通インターフェース `IResourceFetcher` を通じて、環境に応じた fetcher 実装を切り替えます。

- Tauri 環境では Rust バックエンドを `invoke` 経由で呼び出します
- ブラウザ環境では `fetch` を使って直接 API 通信を行います

## 🧭 ディレクトリ構成

```txt
services/api/
├── IResourceFetcher.ts     // 共通インターフェース定義
├── createFetcher.ts        // 環境に応じた fetcher を生成
├── BrowserFetcher.ts       // ブラウザ環境向け fetcher 実装
├── LocalFetcher.ts         // ローカル保存モード fetcher 実装
├── MockFetcher.ts          // 開発・テスト用 fetcher 実装
├── TauriFetcher.ts         // Tauri 環境向け fetcher 実装
└── README.md               // このドキュメント
```

## 📴 ローカル保存モード（Tauri）

Memories は Tauri バックエンドを使って、ユーザのリソースをローカルに保存できます。  
このモードではストレージサーバは不要です。

- `.env` に `NEXT_PUBLIC_API_MODE=local` を設定
- `createFetcher()` が `LocalFetcher` を使用
- 保存先は OS に応じた `data_dir()` に配置されます

## 🔍 環境判定ロジック

`createFetcher.ts` では `window.__TAURI_IPC__` の存在によって Tauri 環境かどうかを判定しています。

```ts
const isTauri = typeof window !== "undefined" && (window as any).__TAURI_IPC__;
```

この判定は Tauri WebView でのみ `true` になります。

## 🧩 拡張方法

新しい環境（例：Electron）に対応する場合は、以下の手順で拡張できます：

1. `IResourceFetcher` を実装した新しい fetcher クラスを作成
2. `createFetcher.ts` に判定ロジックと分岐を追加
3. 必要に応じて `detectRuntimeEnv()` をユーティリティ化

## ⚠️ 注意点

- `authToken` が必須であるため、`createFetcher()` 呼び出し前に認証状態を確認してください
- Tauri 環境では `invoke` のコマンド名と引数が Rust 側と一致している必要があります

## 🛠️ 使用例

```ts
import { createFetcher } from "@/services/api/createFetcher";

const fetcher = createFetcher("music", enableCache, authToken);
const summary = await fetcher.getResourcesSummary();
```

📝 更新履歴
| 日付 |更新 | 内容 |
|---|---|---|
| 2025-08-24 | Tsutomu Funada | 初版 |
