#!/bin/bash
# Production startup script
# Forces NODE_ENV=production for true production mode

echo "🚀 Starting application in PRODUCTION mode..."
NODE_ENV=production tsx server/index.ts