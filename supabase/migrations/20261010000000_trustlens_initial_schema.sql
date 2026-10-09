-- TRUSTLENS: Supabase PostgreSQL Schema Migration
-- Migration: 20261010000000_trustlens_initial_schema.sql

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'analyst', 'expert', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level_type AS ENUM ('lower_risk', 'needs_verification', 'elevated_risk');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE analysis_status_type AS ENUM ('pending', 'completed', 'partial', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_stance_type AS ENUM ('supports', 'contradicts', 'unresolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users if Supabase auth is active)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role user_role DEFAULT 'user',
  preferred_language VARCHAR(10) DEFAULT 'en',
  intended_use TEXT DEFAULT 'personal_verification',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme VARCHAR(10) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  allow_data_analytics BOOLEAN DEFAULT FALSE,
  data_retention_days INT DEFAULT 90,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANALYSES
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  input_type VARCHAR(20) NOT NULL CHECK (input_type IN ('text', 'image', 'url')),
  original_input TEXT NOT NULL,
  extracted_text TEXT,
  detected_language VARCHAR(10) DEFAULT 'en',
  risk_level risk_level_type NOT NULL DEFAULT 'needs_verification',
  risk_score INT NOT NULL DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  uncertainty_rating VARCHAR(20) DEFAULT 'moderate',
  summary TEXT NOT NULL,
  methodology TEXT,
  status analysis_status_type DEFAULT 'completed',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ANALYSIS CLAIMS
CREATE TABLE IF NOT EXISTS analysis_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  position INT DEFAULT 1,
  assessment TEXT,
  verification_status VARCHAR(50) DEFAULT 'unverified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RISK INDICATORS
CREATE TABLE IF NOT EXISTS risk_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  indicator_name TEXT NOT NULL,
  indicator_category VARCHAR(50) NOT NULL,
  observed_snippet TEXT,
  explanation TEXT NOT NULL,
  limitation TEXT NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EVIDENCE SOURCES
CREATE TABLE IF NOT EXISTS evidence_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES analysis_claims(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  source_type VARCHAR(50) DEFAULT 'reputable_media',
  stance evidence_stance_type DEFAULT 'unresolved',
  published_date VARCHAR(50),
  retrieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. UPLOADED FILES
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  ocr_extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ANALYSIS FEEDBACK
CREATE TABLE IF NOT EXISTS analysis_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ASSISTANT CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'Verification Assistant Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COMMUNITY CLAIMS & COMMENTS
CREATE TABLE IF NOT EXISTS community_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  summary TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'resolved', 'closed')),
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES community_claims(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  evidence_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES community_claims(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (claim_id, user_id)
);

-- 13. CONTENT REPORTS (FOR MODERATION)
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_item_type VARCHAR(30) NOT NULL CHECK (reported_item_type IN ('community_claim', 'community_comment', 'user', 'analysis')),
  reported_item_id TEXT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXPERTS & REVIEW REQUESTS
CREATE TABLE IF NOT EXISTS experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  expertise_area TEXT NOT NULL,
  bio TEXT NOT NULL,
  organization TEXT NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  languages_spoken TEXT[] DEFAULT '{"en"}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expert_review_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES community_claims(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  claim_text TEXT NOT NULL,
  justification TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'assigned', 'in_review', 'completed', 'declined')),
  expert_notes TEXT,
  verdict TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CITIZEN REPORTING RESOURCES (REAL CHANNELS)
CREATE TABLE IF NOT EXISTS reporting_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  jurisdiction TEXT NOT NULL,
  official_url TEXT NOT NULL,
  description TEXT NOT NULL,
  handling_process TEXT NOT NULL,
  verified_date VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. EDUCATIONAL LESSONS & PROGRESS
CREATE TABLE IF NOT EXISTS educational_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  reading_time_mins INT DEFAULT 5,
  content_markdown TEXT NOT NULL,
  quiz_json JSONB,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES educational_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT TRUE,
  quiz_score INT DEFAULT 100,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  notification_type VARCHAR(50) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type VARCHAR(50),
  target_id TEXT,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_claims_created_at ON community_claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
