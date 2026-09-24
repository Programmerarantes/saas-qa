-- Docker's first-run entrypoint and local CI bootstrap.
\i /docker-entrypoint-initdb.d/migrations/001_software_quality_lab.sql

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (version)
VALUES ('001_software_quality_lab.sql')
ON CONFLICT (version) DO NOTHING;
