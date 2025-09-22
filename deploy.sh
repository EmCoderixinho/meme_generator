#!/bin/bash

# Production Deployment Script for Meme Generator (Linux/Mac)
# This script deploys the meme generator application for production

echo "🚀 Starting Meme Generator Production Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please run setup first."
    echo "   Copy env-template to .env and configure it."
    exit 1
fi

echo "📦 Building and starting production services..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting production services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check backend
curl -f http://localhost:3000/api/config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not healthy"
    docker-compose logs backend
    exit 1
fi

# Check frontend
curl -f http://localhost/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not healthy"
    docker-compose logs frontend
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   Database: localhost:3306"
echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"