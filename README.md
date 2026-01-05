# Net-Sentry

A lightweight, self-hosted Uptime Monitor built with Go (Fiber) and React (Vite).

## Features
- **Monitor Engine**: Checks your URLs every 60 seconds.
- **Dashboard**: View status (UP/DOWN) and response times.
- **Single Container**: Deploys as a single Docker container with embedded frontend.

## Prerequisites
- Docker (if running the container)
- Go 1.23+ and Node.js 20+ (if developing locally)

## specific steps on how to run this workflow

### Using Docker (Recommended)
You can build and run the entire application using Docker without installing Go or Node.js locally.

1. Build the image:
   ```bash
   docker build -t net-sentry .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -v net-sentry-data:/data net-sentry
   ```

3. Open `http://localhost:3000` in your browser.

### Local Development
If you have Go and Node.js installed:

1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend**:
   ```bash
   # Ensure dependencies are installed
   go mod download
   # Run the server
   go run main.go
   ```
   Note: You will need to proxy requests from frontend to backend or configure CORS if running separately.

## Project Structure
- `frontend/`: React + Vite + Tailwind CSS application.
- `database/`: SQLite connection and GORM models.
- `handlers/`: HTTP API handlers.
- `models/`: Database struct definitions.
- `monitor/`: Background monitoring engine.
- `main.go`: Application entry point.
- `Dockerfile`: Multi-stage build definition.
