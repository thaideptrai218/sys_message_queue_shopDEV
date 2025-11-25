-- Slave User Setup Script
-- This script runs automatically when the slave container starts

-- Create application user (tipsjs) with read-only privileges
CREATE USER IF NOT EXISTS 'tipsjs'@'%' IDENTIFIED BY '123456';

-- Grant read-only privileges on shopDEV database to tipsjs user
GRANT SELECT ON shopDEV.* TO 'tipsjs'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;