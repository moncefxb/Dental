-- Replace previous customer-facing reference strings with opaque unique values.
-- The legacy NOT NULL/UNIQUE column remains only for compatibility with the reconstructed DB schema.
-- It is excluded from every customer/admin response and export.
UPDATE appointments SET reference = lower(hex(randomblob(16)));
