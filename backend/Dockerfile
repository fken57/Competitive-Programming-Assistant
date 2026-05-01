FROM golang:1.22-alpine AS builder

# ワーキングディレクトリの設定
WORKDIR /app

# 依存関係を先にコピーしてキャッシュを利用する
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピーしてビルド
COPY . .
RUN go build -o main .

# --- Run Stage ---
FROM alpine:latest

WORKDIR /app

# ビルドしたバイナリだけをコピー
COPY --from=builder /app/main .
# もし .env を使うならコピー（ただし本番では環境変数設定を推奨）
# COPY --from=builder /app/.env . 

# 実行
CMD ["./main"]