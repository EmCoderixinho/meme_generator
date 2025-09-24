# Meme Generator Application

A full-stack meme generation application built with React frontend and NestJS backend, deployed on AWS EC2.

### 🛠️ Technology Stack
- **Backend**: Node.js with NestJS framework (TypeScript)
- **Frontend**: React 19 with TypeScript and Tailwind CSS
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **Cloud Deployment**: AWS EC2

## 🚀 AWS Deployment

### Overview
This application has been successfully deployed to AWS EC2 using Docker containers. The deployment includes:
- **Frontend**: React application served on port 3000
- **Backend**: NestJS API server on port 5000
- **Database**: MySQL 8.0 database on port 3306

### Deployment Architecture
```
Internet → EC2 Instance (Ubuntu)
├── Frontend Container (React) - Port 3000
├── Backend Container (NestJS) - Port 5000
└── Database Container (MySQL) - Port 3306
```

### Deployment Steps

#### 1. AWS EC2 Instance Setup
- **Instance Type**: EC2 instance in `eu-north-1` region
- **Instance ID**: `i-xxxxxxxxx` (ec2-16-171-2-238.eu-north-1.compute.amazonaws.com)
- **Operating System**: Ubuntu
- **Security Groups**: Configured to allow HTTP (80), HTTPS (443), and SSH (22) traffic

#### 2. Server Preparation
```bash
# Connect to EC2 instance
ssh -i "meme_generator.pem" ubuntu@ec2PublicIP.eu-north-1.compute.amazonaws.com

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Git
sudo apt install -y git

# Install additional dependencies
sudo apt install -y curl wget
```

#### 3. Application Deployment
```bash
# Clone the repository
git clone https://github.com/EmCoderixinho/meme_generator
cd meme_generator

# Set up environment variables
cp env-template .env

# Configure environment variables for production
# Edit .env file with production values:
# - DATABASE_PASSWORD=<secure-password>
# - REACT_APP_BACKEND_URL=/api

# Deploy with Docker Compose
docker-compose up -d
```

#### 4. Verification
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:5000/api/config  # Backend health check
curl http://localhost:3000             # Frontend
```

### Access Information

#### Application URLs
- **Frontend**: `http://ec2PublicIP.eu-north-1.compute.amazonaws.com:3000`
- **Backend API**: `http://ec2PublicIP.eu-north-1.compute.amazonaws.com:5000`
- **API Documentation**: `http://ec2PublicIP.eu-north-1.compute.amazonaws.com:5000/api`

#### Port Configuration
- **Frontend**: 3000 (mapped to container port 80)
- **Backend**: 5000 (mapped to container port 3000)
- **Database**: 3306 (internal container communication)

### Environment Configuration

The application uses the following environment variables (configured in `.env`):

```env
# Database Configuration
DATABASE_PASSWORD=DevPassword123!
DATABASE_HOST=database
DATABASE_PORT=3306
DATABASE_NAME=meme_creator_db
DATABASE_USERNAME=root

# Application Configuration
NODE_ENV=production
PORT=3000

# Frontend Configuration
REACT_APP_BACKEND_URL=/api

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_12345
JWT_EXPIRES_IN=24h
```

### Docker Services

#### Backend Service
- **Image**: Custom NestJS application
- **Port**: 5000:3000
- **Health Check**: `http://localhost:3000/api/config`
- **Dependencies**: MySQL database

#### Frontend Service
- **Image**: Custom React application with Nginx
- **Port**: 3000:80
- **Health Check**: `http://localhost/health`
- **Dependencies**: Backend service

#### Database Service
- **Image**: MySQL 8.0
- **Port**: 3306:3306
- **Health Check**: MySQL ping command
- **Volumes**: Persistent data storage

### Monitoring and Maintenance

#### Container Management
```bash
# View running containers
docker ps

# View container logs
docker logs meme_frontend
docker logs meme_backend
docker logs meme_database

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Update and redeploy
git pull
docker-compose up -d --build
```

#### Database Management
```bash
# Access MySQL container
docker exec -it meme_database mysql -u root -p

# Backup database
docker exec meme_database mysqldump -u root -p meme_creator_db > backup.sql

# Restore database
docker exec -i meme_database mysql -u root -p meme_creator_db < backup.sql
```

### Security Considerations

1. **Firewall Configuration**: Only necessary ports (22, 80, 443, 3000, 5000) are open
2. **Database Security**: MySQL is not exposed to external connections
3. **Environment Variables**: Sensitive data is stored in `.env` file
4. **SSL/HTTPS**: Consider implementing SSL certificates for production use

### Troubleshooting

#### Common Issues
1. **Port Conflicts**: Ensure ports 3000 and 5000 are available
2. **Memory Issues**: EC2 instance should have at least 2GB RAM
3. **Database Connection**: Check if MySQL container is healthy
4. **Environment Variables**: Verify `.env` file configuration

#### Logs and Debugging
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Check container health
docker-compose ps

## Local Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/EmCoderixinho/meme_generator
cd meme_generator

# Set up environment
cp env-template .env

# Start development environment
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
```

### Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: MySQL 8.0
- **Containerization**: Docker, Docker Compose
- **Cloud Provider**: AWS EC2

---

*Deployment completed successfully on AWS EC2 with Docker containers. The application is accessible at the provided URLs and fully functional.*
