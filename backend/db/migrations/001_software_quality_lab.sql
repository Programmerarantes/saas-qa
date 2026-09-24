CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- The previous product was a news aggregator. These tables are intentionally
-- removed because their semantics do not belong to the Software Quality Lab.
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) NOT NULL CHECK (type IN ('ARTICLE', 'CASE_STUDY')),
  slug VARCHAR(180) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL CHECK (category IN ('Test Design', 'Automation', 'Quality Engineering', 'Engineering')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL CHECK (locale IN ('pt-BR', 'en')),
  title VARCHAR(240) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  UNIQUE (content_id, locale)
);

CREATE INDEX IF NOT EXISTS content_entries_public_idx
  ON content_entries (status, featured, published_at DESC);
CREATE INDEX IF NOT EXISTS content_entries_tags_idx
  ON content_entries USING GIN (tags);

CREATE TABLE IF NOT EXISTS lab_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED')),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES lab_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS lab_sessions_active_idx ON lab_sessions (token_hash, expires_at)
  WHERE revoked_at IS NULL;

-- Safe starter content. Professional biography and links remain configurable placeholders.
INSERT INTO content_entries (type, slug, category, tags, status, featured, published_at)
VALUES
  ('ARTICLE', 'como-pensar-em-riscos-de-qualidade', 'Quality Engineering', ARRAY['test-strategy', 'debugging'], 'PUBLISHED', TRUE, NOW()),
  ('CASE_STUDY', 'placeholder-case-study', 'Automation', ARRAY['playwright', 'typescript', 'e2e'], 'PUBLISHED', TRUE, NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_translations (content_id, locale, title, summary, content)
SELECT id, 'pt-BR', 'Como pensar em riscos de qualidade', 'Conteúdo inicial demonstrativo do Software Quality Lab.',
       E'# Conteúdo inicial\n\nEste é um **placeholder editorial** para validar o fluxo de publicação. Substitua este texto pelo seu primeiro artigo no Admin.\n\n## Uma pergunta útil\n\n> Que risco importante pode chegar ao usuário sem ser percebido pelo teste mais óbvio?\n\n```ts\nconst risk = identifyRisk({ impact: ''high'', likelihood: ''medium'' })\n```'
FROM content_entries WHERE slug = 'como-pensar-em-riscos-de-qualidade'
ON CONFLICT (content_id, locale) DO NOTHING;

INSERT INTO content_translations (content_id, locale, title, summary, content)
SELECT id, 'en', 'Thinking in quality risks', 'Starter editorial placeholder for Software Quality Lab.',
       E'# Starter content\n\nThis is an **editorial placeholder**. Replace it with your first article from the Admin.\n\n## A useful question\n\nWhat important risk can reach users without being caught by the most obvious test?'
FROM content_entries WHERE slug = 'como-pensar-em-riscos-de-qualidade'
ON CONFLICT (content_id, locale) DO NOTHING;

INSERT INTO content_translations (content_id, locale, title, summary, content)
SELECT id, 'pt-BR', 'Case study placeholder', 'Estrutura inicial para registrar uma experiência real sem expor dados privados.',
       E'# Contexto\n\nPlaceholder para um case study baseado em uma experiência real, sem dados proprietários.\n\n## Problema\n\nDescreva o problema observável e o impacto para usuários ou negócio.\n\n## Estratégia de teste\n\nDescreva riscos, técnicas, execução, achados e resultado.\n\n## O que aprendi\n\nRegistre aprendizados e o que faria diferente.'
FROM content_entries WHERE slug = 'placeholder-case-study'
ON CONFLICT (content_id, locale) DO NOTHING;
