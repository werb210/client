#!/bin/bash

echo "🚀 Starting Application in 100% Production Mode"
echo "=============================================="

# Set production environment variables
export NODE_ENV=production
export REPLIT_ENVIRONMENT=production

# Ensure build is up to date
echo "📦 Building application..."
npm run build

echo "🔥 Starting production server with compiled JavaScript..."
echo "Environment: NODE_ENV=$NODE_ENV, REPLIT_ENVIRONMENT=$REPLIT_ENVIRONMENT"

# Start the production server using compiled JavaScript
node dist/index.js