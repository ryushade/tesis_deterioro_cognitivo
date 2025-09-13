-- Database initialization script
-- This script will run when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- (Note: POSTGRES_DB in docker-compose already creates the database)

-- You can add initial data or schema modifications here
-- For example:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Example: Create an admin user table for future use
-- CREATE TABLE IF NOT EXISTS admin_users (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- You can add more initialization scripts here as needed
