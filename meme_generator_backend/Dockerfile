FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:18-slim AS production

# Install system dependencies and fonts
RUN apt-get update && apt-get install -y \
    fontconfig \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-freefont-ttf \
    fonts-opensans \
    fonts-roboto \
    fonts-noto \
    fonts-ubuntu \
    fonts-liberation2 \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Update font cache
RUN fc-cache -fv

WORKDIR /usr/src/app

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /usr/src/app/dist ./dist

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/config || exit 1

# Start the application
CMD ["node", "dist/main.js"]
