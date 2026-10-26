import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { seedInitialData } from './seed.js';

if (!fs.existsSync(config.dataDir)) {
  fs.mkdirSync(config.dataDir, { recursive: true });
}

if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const dbPath = path.join(config.dataDir, 'trustlens.db');
export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      display_name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      preferred_language TEXT DEFAULT 'en',
      intended_use TEXT DEFAULT 'personal_verification',
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'light',
      email_notifications INTEGER DEFAULT 1,
      in_app_notifications INTEGER DEFAULT 1,
      allow_data_analytics INTEGER DEFAULT 0,
      data_retention_days INTEGER DEFAULT 90,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      input_type TEXT NOT NULL,
      original_input TEXT NOT NULL,
      extracted_text TEXT,
      detected_language TEXT DEFAULT 'en',
      risk_level TEXT DEFAULT 'needs_verification',
      risk_score INTEGER DEFAULT 50,
      uncertainty_rating TEXT DEFAULT 'moderate',
      summary TEXT NOT NULL,
      methodology TEXT,
      status TEXT DEFAULT 'completed',
      is_public INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES profiles(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS analysis_claims (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      claim_text TEXT NOT NULL,
      position INTEGER DEFAULT 1,
      assessment TEXT,
      verification_status TEXT DEFAULT 'unverified',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_indicators (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      indicator_name TEXT NOT NULL,
      indicator_category TEXT NOT NULL,
      observed_snippet TEXT,
      explanation TEXT NOT NULL,
      limitation TEXT NOT NULL,
      severity TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence_sources (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      claim_id TEXT,
      title TEXT NOT NULL,
      publisher TEXT NOT NULL,
      url TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      source_type TEXT DEFAULT 'reputable_media',
      stance TEXT DEFAULT 'unresolved',
      published_date TEXT,
      retrieved_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS uploaded_files (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      analysis_id TEXT,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      ocr_extracted_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analysis_feedback (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      user_id TEXT,
      rating INTEGER,
      feedback_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assistant_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      analysis_id TEXT,
      title TEXT DEFAULT 'Verification Assistant Chat',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assistant_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id) REFERENCES assistant_conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS community_claims (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      analysis_id TEXT,
      title TEXT NOT NULL,
      claim_text TEXT NOT NULL,
      summary TEXT,
      status TEXT DEFAULT 'active',
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_comments (
      id TEXT PRIMARY KEY,
      claim_id TEXT NOT NULL,
      user_id TEXT,
      parent_id TEXT,
      content TEXT NOT NULL,
      evidence_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(claim_id) REFERENCES community_claims(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS community_votes (
      id TEXT PRIMARY KEY,
      claim_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      vote_type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(claim_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS content_reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT,
      reported_item_type TEXT NOT NULL,
      reported_item_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS experts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      full_name TEXT NOT NULL,
      expertise_area TEXT NOT NULL,
      bio TEXT NOT NULL,
      organization TEXT NOT NULL,
      verification_status TEXT DEFAULT 'verified',
      languages_spoken TEXT DEFAULT '["en"]',
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expert_profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      title TEXT NOT NULL,
      organization TEXT NOT NULL,
      expertise_area TEXT NOT NULL,
      category TEXT NOT NULL,
      bio TEXT NOT NULL,
      official_reference_url TEXT NOT NULL,
      is_public_reference INTEGER DEFAULT 1,
      is_demo_expert INTEGER DEFAULT 0,
      can_receive_requests INTEGER DEFAULT 0,
      languages_spoken TEXT DEFAULT '["en"]',
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expert_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      expert_id TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      preferred_language TEXT DEFAULT 'en',
      attachment_url TEXT,
      status TEXT DEFAULT 'pending',
      expert_notes TEXT,
      response_text TEXT,
      responded_at TEXT,
      closed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expert_messages (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(request_id) REFERENCES expert_requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expert_review_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      claim_id TEXT,
      analysis_id TEXT,
      expert_id TEXT,
      claim_text TEXT NOT NULL,
      justification TEXT NOT NULL,
      status TEXT DEFAULT 'submitted',
      expert_notes TEXT,
      verdict TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reporting_resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      official_url TEXT NOT NULL,
      description TEXT NOT NULL,
      handling_process TEXT NOT NULL,
      verified_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS educational_lessons (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      reading_time_mins INTEGER DEFAULT 5,
      content_markdown TEXT NOT NULL,
      quiz_json TEXT,
      sort_order INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      quiz_score INTEGER DEFAULT 100,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link_url TEXT,
      is_read INTEGER DEFAULT 0,
      notification_type TEXT DEFAULT 'system',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      admin_user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}
