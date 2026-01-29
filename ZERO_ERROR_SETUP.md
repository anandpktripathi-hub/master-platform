# Zero Error Setup Checklist

## 1. Docker Setup (Recommended)
- [ ] Install Docker Desktop
- [ ] Run `docker-compose up` in project root
- [ ] Confirm MongoDB, backend, and frontend containers start
- [ ] Backend should use: `mongodb://mongodb:27017/smetasc-saas`

## 2. Local MongoDB Setup (Alternative)
- [ ] Install MongoDB Community Edition
- [ ] Start MongoDB service (port 27017)
- [ ] Or run: `docker run -d -p 27017:27017 --name mongodb mongo:7.0`
- [ ] Copy `.env.example` to `.env` and adjust values
- [ ] Set `DATABASE_URI` in `.env` to `mongodb://localhost:27017/master-platform`

## 3. Backend Startup
- [ ] Run `npm run build`
- [ ] Run `npm run start:dev`
- [ ] Backend should exit with error if MongoDB is unreachable

# Zero Error Setup Instructions

## 1. Docker Setup (Recommended)
- Ensure Docker Desktop is installed.
- In your project root, run:

    docker-compose up

- This will start MongoDB, backend, and frontend with correct networking and environment variables.
- Backend will use the connection string: mongodb://mongodb:27017/smetasc-saas

## 2. Local MongoDB Setup (Alternative)
- Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Start MongoDB service (default port 27017).
- Or run MongoDB in Docker:

    docker run -d -p 27017:27017 --name mongodb mongo:7.0

- Copy .env.example to .env and adjust values as needed.
- Ensure DATABASE_URI in .env is set to mongodb://localhost:27017/master-platform

## 3. Backend Startup
- Run:

    npm run build
    npm run start:dev

- Backend will check MongoDB connection on startup and exit with error if unreachable.

---
## Troubleshooting Quick Reference
- ECONNREFUSED: Check MongoDB is running and URI in `.env` is correct
- For Docker: Use `docker-compose logs` to view logs
- For local: Check MongoDB service status

## Environment Variables
- See `backend/.env.example` for all required variables
- Always set secrets and URIs before production deployment

---
This setup ensures zero silent errors and fast troubleshooting for backend startup.
