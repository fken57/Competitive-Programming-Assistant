FROM node:22-alpine AS frontend-builder

WORKDIR /frontend
COPY react-sample-app/package.json react-sample-app/package-lock.json ./
RUN npm ci
COPY react-sample-app/ ./
ARG REACT_APP_API_BASE_URL=/apis
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
RUN npm run build

FROM golang:1.26-alpine AS backend-builder

WORKDIR /backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/cpa .

FROM alpine:3.23

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S cpa \
    && adduser -S -G cpa cpa

WORKDIR /app
COPY --from=backend-builder /out/cpa /app/cpa
COPY --from=frontend-builder /frontend/build /app/static

ENV APP_ENV=production
ENV PORT=8080
ENV STATIC_DIR=/app/static

USER cpa
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

CMD ["/app/cpa"]
