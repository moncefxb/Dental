-- Self-service manage links: only a SHA-256 hash of the token is stored.
ALTER TABLE appointments ADD COLUMN manage_token_hash TEXT NOT NULL DEFAULT '';
