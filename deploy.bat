@echo off
REM Production Deployment Script for Meme Generator (Windows)
REM This script deploys the meme generator application for production

echo 🚀 Starting Meme Generator Production Deployment...

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found! Please run setup first.
    echo    Copy env-template to .env and configure it.
    exit /b 1
)

echo 📦 Building and starting production services...

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

docker-compose build --no-cache

REM Build and start services
echo 🔨 Building and starting production services...
docker-compose up --build -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak > nul

REM Check service health
echo 🔍 Checking service health...

REM Check backend
curl -f http://localhost:5000/api/config > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
) else (
    echo ❌ Backend is not healthy
    docker-compose logs backend
    exit /b 1
)

REM Check frontend
curl -f http://localhost:3000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is healthy
) else (
    echo ❌ Frontend is not healthy
    docker-compose logs frontend
    exit /b 1
)

echo 🎉 Production deployment completed successfully!
echo.
echo 📋 Service URLs:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:3000
echo    Database: localhost:3306
echo.
echo 📊 Useful commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
