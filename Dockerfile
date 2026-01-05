# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy frontend build to backend/frontend/dist so it can be embedded
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
RUN CGO_ENABLED=1 GOOS=linux go build -o net-sentry main.go

# Stage 3: Runtime
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache sqlite-libs ca-certificates
COPY --from=backend-builder /app/net-sentry .
# Create data volume directory
RUN mkdir -p /data
ENV DATABASE_URL=/data/net-sentry.db
EXPOSE 3000
CMD ["./net-sentry"]
