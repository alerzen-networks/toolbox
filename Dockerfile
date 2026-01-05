# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Use legacy peer deps regarding react-simple-maps/d3-scale issues in history
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
# Install gcc/musl-dev for CGO (sqlite3)
RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy frontend build to backend/frontend/dist so it can be embedded
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
# Build static binary
RUN CGO_ENABLED=1 GOOS=linux go build -o net-sentry main.go

# Stage 3: Runtime
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache sqlite-libs ca-certificates
COPY --from=backend-builder /app/net-sentry .
# Create data volume directory
RUN mkdir -p /data
ENV DATABASE_URL=/data/net-sentry.db
EXPOSE 8081
CMD ["./net-sentry"]
