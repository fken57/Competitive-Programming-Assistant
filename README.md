# Competitive Programming Assistant

競技プログラミングで頻出するグラフ・配列アルゴリズムの可視化と、再現可能なテストケース生成を行うWebアプリケーションです。

- 公開サイト: [competitive-programming-assistant.trap.show](https://competitive-programming-assistant.trap.show)
- 公開API仕様: [docs/openapi.yaml](docs/openapi.yaml)
- 本番デプロイ手順: [docs/production-deployment.md](docs/production-deployment.md)

## サイト構成

| 画面 | URL | 概要 |
| --- | --- | --- |
| Home | `/` | 各機能への入口 |
| Graph Analyzer | `/graph` | グラフ入力、可視化、アルゴリズム実行、静的解析一覧 |
| Array Analyzer | `/array` | 整数配列の静的アルゴリズム・Queryアルゴリズム実行 |
| Random Gen | `/random-gen` | seedから再現可能な配列・木・グラフ入力の生成 |
| Not Found | その他 | Reactの404画面 |

画面URLはSPAとして配信されます。`/array`などを直接開いた場合や再読み込みした場合も、GoサーバーがReactの`index.html`を返します。一方、存在しない`/apis/...`と静的アセットはHTTP 404になります。

## 主な機能

### Graph Analyzer

- 無向・有向、重みなし・重み付きグラフの入力と可視化
- BFS、DFS、トポロジカルソート、SCC、連結成分、閉路検出
- Union-Find、Low-Link、LCA、二部グラフ判定、木判定・木の直径
- Dijkstra、Prim
- 複数の静的解析をまとめて返すbatch API

APIへ渡す隣接リストと頂点番号は0-basedです。

### Array Analyzer

配列長は1〜200,000、各要素は`-10^9`〜`10^9`です。

静的アルゴリズム:

- 累積和、座標圧縮、転倒数、静的MEX
- Run Length Encoding
- 右側の次に大きい・小さい要素
- 最長重複なし部分配列

Queryアルゴリズム:

- 静的区間和
- 部分配列和がKに等しい個数
- 部分配列和の剰余がRに等しい個数
- 固定長窓の最小値・最大値
- 和がK以下のペア数
- 差の絶対値がK以下のペア数

区間APIは0-based半開区間`[left, right_exclusive)`です。画面上では1-basedの両端を含む区間に変換して表示します。

### Random Gen

- `splitmix64-v1`とunsigned 64-bit seedによる再現可能な生成
- 配列、木、グラフに対する典型・コーナーケース生成
- `N <= 200,000`、`M <= 500,000`、最大100テストケース
- 生成結果は最大10 MiB
- recipe共有URL、再生成、プリセット保存
- 生成履歴と撃墜ケースを10件単位でページング

未ログイン時の生成履歴はブラウザに保存されます。ログイン時の履歴・撃墜ケース・プリセットはサーバーに保存され、本人だけが参照できます。生成履歴は24時間で失効し、最大50件です。履歴と撃墜ケースは削除できます。

## 認証

- ユーザー名: 3〜50文字
- パスワード: 8〜72文字
- ログイン状態: HttpOnly・SameSite=Laxの`cpa_session` Cookie
- 本番環境ではCookieにSecure属性を付与

Cookie認証APIをブラウザ以外から利用する場合は、ログイン応答の`Set-Cookie`を以後のリクエストへ送信してください。

## 公開API

APIのベースパスは`/apis`です。OpenAPI 3.1定義に、全公開エンドポイント、リクエスト・レスポンスschema、Cookie認証、入力制約を掲載しています。

- OpenAPI: [docs/openapi.yaml](docs/openapi.yaml)
- Health check: `GET /healthz`
- API疎通確認: `GET /apis/hello`

例:

```bash
curl -X POST https://competitive-programming-assistant.trap.show/apis/array/count_subarrays_sum_equal_k \
  -H "Content-Type: application/json" \
  -d '{"values":[1,-1,1,-1],"target":0}'
```

レスポンス:

```json
{"count":4}
```

## ローカル開発

必要環境:

- Node.js 22
- Go 1.26
- MariaDB（任意。未設定時は認証・保存データがメモリ動作）

フロントエンド:

```bash
cd react-sample-app
npm ci
npm run dev
```

バックエンド:

```bash
cd backend
go run .
```

開発時の既定値はフロントエンド`http://localhost:3000`、API`http://localhost:8080/apis`です。バックエンドの環境変数は[backend/.env.example](backend/.env.example)、フロントエンドは[react-sample-app/.env.example](react-sample-app/.env.example)を参照してください。

## Docker

ルートDockerfileはReactをビルドした後、Go APIと静的ファイルを1つのRuntimeイメージへまとめます。

```bash
docker build -t competitive-programming-assistant .
docker run --rm -p 8080:8080 \
  -e APP_ENV=production \
  -e FRONTEND_ORIGIN=http://localhost:8080 \
  -e DATABASE_URL='mariadb://user:password@host:3306/database' \
  competitive-programming-assistant
```

本番環境のデータベース・NeoShowcase設定は[本番デプロイ手順](docs/production-deployment.md)を参照してください。

## ディレクトリ構成

```text
backend/             Go API、domain/usecase/handler、MariaDB migration
react-sample-app/    Reactフロントエンド
docs/openapi.yaml    公開APIのOpenAPI 3.1定義
docs/                運用・デプロイ文書
Dockerfile           フロント・バック統合Runtimeイメージ
```

## テスト

### ローカル実行

```bash
cd backend
go test -count=1 . ./internal/...

# Backend Architectureだけを実行
go test . -run '^TestArchitecture' -count=1

cd ../react-sample-app
npm ci
npm test -- --watchAll=false --runInBand

# 本番用ビルドの確認（現在のCI対象外）
npm run build
```

Backendは、手動確認用の`cmd`に複数の`main`関数があるため、`go test ./...`ではなく上記の対象範囲を使用します。

### CI

GitHub Actionsの`CI`ワークフローは、すべてのPull Requestと`main`へのpushで次の3ジョブを並列実行します。Actions画面からの手動実行も可能です。

| ジョブ | 実行内容 |
| --- | --- |
| Backend Architecture | `go test . -run '^TestArchitecture' -count=1 -timeout=2m` |
| Backend Unit | `go test -race -count=1 -timeout=5m . ./internal/...` |
| Frontend Unit | `npm ci`後、`CI=true`で`npm test -- --watchAll=false --runInBand` |

実行環境はUbuntu、Goは`backend/go.mod`の指定バージョン、Node.jsは22系です。依存は`go.sum`と`package-lock.json`を基準にキャッシュし、同じPR・ブランチの古い実行はキャンセルします。Backend Unitでは軽量なArchitectureテストも再実行します。

Architectureテストは、本番用の`internal/**/*.go`のimportを解析し、次の依存を禁止します。

| 依存元 | 禁止する依存先 |
| --- | --- |
| domain | usecase・handler・infrastructure、Echo・sqlx・MySQL driver・`database/sql` |
| usecase | handler・infrastructure |
| handler | infrastructure |
| infrastructure | handler・usecase |

`main.go`は依存を組み立てる場所として扱い、`*_test.go`からのメモリRepository利用は許容します。禁止依存の検出、許容依存、テストコードの除外もテストしています。

今回のCIにはE2E、Frontend Architecture、DB統合、本番用ビルドの検証を含みません。MariaDBは起動せず、`MARIADB_TEST_DSN`を空にするため、既存のmigration統合テストはスキップされます。CI成功はDB統合の成功を意味しません。

3ジョブの成功確認後、ブランチ保護ルールで`Backend Architecture`・`Backend Unit`・`Frontend Unit`を必須チェックに設定できます。ワークフローの追加だけではブランチ保護ルールは変更されません。

`-race`には対応する64bit環境とCコンパイラが必要です。手元の環境で対応していない場合は通常のGoテストを実行し、競合検出はCIで確認してください。
