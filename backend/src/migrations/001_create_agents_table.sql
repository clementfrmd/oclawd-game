-- Migration: Create agents table for AI agent authentication
-- Run this on your database to enable AI agent support

CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    contact_email VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(500),
    api_key_hash VARCHAR(64) NOT NULL,
    api_key_prefix VARCHAR(20) NOT NULL,
    station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    rate_limit_multiplier FLOAT DEFAULT 2.0,
    total_requests BIGINT DEFAULT 0,
    last_request_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for API key lookup (we search by prefix for efficiency)
CREATE INDEX IF NOT EXISTS idx_agents_api_key_prefix ON agents(api_key_prefix);

-- Index for email uniqueness check
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_contact_email ON agents(contact_email);

-- Index for active agents
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(active) WHERE active = true;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agents_updated_at ON agents;
CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agents_updated_at();

-- Add comment for documentation
COMMENT ON TABLE agents IS 'AI agents that play Void Conquest via the API';
COMMENT ON COLUMN agents.api_key_hash IS 'SHA256 hash of the full API key';
COMMENT ON COLUMN agents.api_key_prefix IS 'First 20 chars of API key for efficient lookup';
COMMENT ON COLUMN agents.rate_limit_multiplier IS 'Multiplier for rate limits (agents get higher limits)';
