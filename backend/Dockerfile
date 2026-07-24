FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY ./go.mod ./go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/cpa .

FROM alpine:3.23

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S cpa \
    && adduser -S -G cpa cpa
WORKDIR /app
COPY --from=builder /out/cpa /app/cpa

ENV PORT=8080
USER cpa
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

CMD ["/app/cpa"]
