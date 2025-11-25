-- Replication Setup Script for Master
-- This script runs automatically when the master container starts

-- Create replication user
CREATE USER IF NOT EXISTS 'replicator'@'%' IDENTIFIED BY 'rep123456';

-- Grant replication privileges
GRANT REPLICATION SLAVE ON *.* TO 'replicator'@'%';

-- Create application user (tipsjs) with full privileges on shopDEV database
CREATE USER IF NOT EXISTS 'tipsjs'@'%' IDENTIFIED BY '123456';

-- Grant all privileges on shopDEV database to tipsjs user
GRANT ALL PRIVILEGES ON shopDEV.* TO 'tipsjs'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;