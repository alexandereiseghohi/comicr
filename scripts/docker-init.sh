#!/bin/bash
# Docker initialization script for ComicWise
# Creates necessary directories and files for containerized deployment

set -e

echo "🐳 ComicWise Docker Setup"
echo "========================"

# Create necessary directories
mkdir -p ./scripts
mkdir -p ./logs

# Create init database script if it doesn't exist
if [ ! -f "./scripts/init-db.sql" ]; then
    cat > "./scripts/init-db.sql" << 'EOF'
-- ComicWise PostgreSQL initialization script
-- Creates extensions and initial schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log initialization
SELECT 'ComicWise database initialized' as status;
EOF
    echo "✓ Created scripts/init-db.sql"
fi

# Copy example env file if it doesn't exist
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.example" ]; then
        cp ".env.production.example" ".env.production"
        echo "✓ Created .env.production from example"
        echo "⚠️  WARNING: Update .env.production with your actual secrets!"
    fi
fi

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.production with your actual values"
echo "2. For development: docker compose -f docker-compose.dev.yml up"
echo "3. For production: docker compose up -d"
echo ""
