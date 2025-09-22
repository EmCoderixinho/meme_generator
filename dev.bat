@echo off
REM Development Script for Meme Generator (Windows)
REM This script starts the application in development mode with hot reloading

echo 🚀 Starting Meme Generator Development...

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found! Please run setup first.
    echo    Copy env-template to .env and configure it.
    exit /b 1
)

echo 📦 Starting development services...

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.dev.yml down

REM Build and start services
echo 🔨 Building and starting development services...
docker-compose -f docker-compose.dev.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 20 /nobreak > nul

echo 🎉 Development environment is ready!
echo.
echo 📋 Service URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    Database: localhost:3306
echo.
echo 📊 Useful commands:
echo    View logs: docker-compose -f docker-compose.dev.yml logs -f
echo    Stop services: docker-compose -f docker-compose.dev.yml down
echo    Restart services: docker-compose -f docker-compose.dev.yml restart
echo.
echo 🔄 Hot reloading is enabled!
echo    - Frontend changes will auto-reload in browser
echo    - Backend changes will auto-restart the server
