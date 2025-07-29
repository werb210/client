#!/bin/bash
# Production Server Startup Script

echo "🚀 Starting Boreal Financial Client Application in PRODUCTION mode..."
echo "======================================================================="

# Ensure production build exists
if [ ! -f "dist/index.js" ]; then
    echo "⚠️  Production build not found. Building now..."
    npm run build
fi

# Set production environment and start
export NODE_ENV=production
export REPLIT_ENVIRONMENT=production

echo "✅ Environment configured for production"
echo "📦 Starting compiled JavaScript from dist/index.js"
echo "🌐 Server will be available at port 5000"
echo ""

# Start production server
node dist/index.js