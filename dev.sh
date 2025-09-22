#!/bin/bash

# Development Script for Meme Generator (Linux/Mac)
# This script starts the application in development mode with hot reloading

echo "🚀 Starting Meme Generator Development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please run setup first."
    echo "   Copy env-template to .env and configure it."
    exit 1
fi

echo "📦 Starting development services..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Build and start services
echo "🔨 Building and starting development services..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

echo "🎉 Development environment is ready!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Database: localhost:3306"
echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart services: docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "🔄 Hot reloading is enabled!"
echo "   - Frontend changes will auto-reload in browser"
echo "   - Backend changes will auto-restart the server"