-- ComicWise PostgreSQL Initialization Script
-- Runs automatically when PostgreSQL container starts
-- Creates extensions and initializes the database

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Log successful initialization
SELECT 'ComicWise database initialized successfully' as initialization_status;
