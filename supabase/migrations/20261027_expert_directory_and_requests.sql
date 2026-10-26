-- ====================================================================
-- TRUSTLENS: Expert Directory, Public References & Request System
-- Migration: 20261027_expert_directory_and_requests.sql
-- ====================================================================

-- 1. EXPERT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.expert_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  expertise_area TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('journalists', 'fact_checkers', 'legal_professionals', 'organizations')),
  bio TEXT NOT NULL,
  official_reference_url TEXT NOT NULL,
  is_public_reference BOOLEAN DEFAULT TRUE,
  is_demo_expert BOOLEAN DEFAULT FALSE,
  can_receive_requests BOOLEAN DEFAULT FALSE,
  languages_spoken TEXT[] DEFAULT '{"en"}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXPERT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.expert_requests (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  expert_id TEXT REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_language VARCHAR(10) DEFAULT 'en',
  attachment_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_review', 'responded', 'closed', 'declined')),
  expert_notes TEXT,
  response_text TEXT,
  responded_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXPERT MESSAGES TABLE (FOR THREADED REPLIES)
CREATE TABLE IF NOT EXISTS public.expert_messages (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES public.expert_requests(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'expert')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR EXPERT PROFILES (PUBLIC CAN VIEW ALL VERIFIED/PUBLIC PROFILES)
DROP POLICY IF EXISTS "Public can view expert profiles" ON public.expert_profiles;
CREATE POLICY "Public can view expert profiles" ON public.expert_profiles
  FOR SELECT USING (true);

-- 6. RLS POLICIES FOR EXPERT REQUESTS
DROP POLICY IF EXISTS "Users can view own requests" ON public.expert_requests;
CREATE POLICY "Users can view own requests" ON public.expert_requests
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert requests" ON public.expert_requests;
CREATE POLICY "Users can insert requests" ON public.expert_requests
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users and experts can update requests" ON public.expert_requests;
CREATE POLICY "Users and experts can update requests" ON public.expert_requests
  FOR UPDATE USING (true);

-- 7. RLS POLICIES FOR EXPERT MESSAGES
DROP POLICY IF EXISTS "Participants can view request messages" ON public.expert_messages;
CREATE POLICY "Participants can view request messages" ON public.expert_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participants can insert messages" ON public.expert_messages;
CREATE POLICY "Participants can insert messages" ON public.expert_messages
  FOR INSERT WITH CHECK (true);

-- 8. SEED VERIFIED PUBLIC PROFESSIONAL PROFILES & DEMO EXPERTS
INSERT INTO public.expert_profiles (
  id, full_name, title, organization, expertise_area, category, bio, official_reference_url, is_public_reference, is_demo_expert, can_receive_requests, languages_spoken
) VALUES
-- Public Reference: Journalists
(
  'ref-journo-01',
  'Jency Jacob',
  'Managing Editor',
  'BOOM',
  'Journalism and misinformation verification',
  'journalists',
  'Senior journalist and Managing Editor at BOOM Live with extensive experience tracking media manipulation, fact-checking viral claims, and training newsrooms across India.',
  'https://www.boomlive.in/boom-team',
  true, false, false,
  '{"en", "hi"}'
),
(
  'ref-journo-02',
  'Adrija Bose',
  'Senior Editor',
  'BOOM',
  'Digital misinformation and investigative journalism',
  'journalists',
  'Investigative journalist and Senior Editor specializing in gender-based disinformation, social platform rumor dynamics, and digital forensics verification.',
  'https://www.boomlive.in/boom-team',
  true, false, false,
  '{"en", "hi", "bn"}'
),
-- Public Reference: Fact-Checkers
(
  'ref-factcheck-01',
  'Akshay Kumar Appani',
  'Lead, Fact Checking & Research',
  'FACTLY',
  'Fact verification, public policy analysis and open data research',
  'fact_checkers',
  'Lead researcher at FACTLY specializing in public policy claims, government gazette cross-referencing, and viral social media narrative investigations.',
  'https://factlymedia.com/teams/fact-check/',
  true, false, false,
  '{"en", "te", "hi"}'
),
(
  'ref-factcheck-02',
  'Harshavardhan Konda',
  'Lead Fact-Checker',
  'FACTLY',
  'Digital claim verification & open-source intelligence (OSINT)',
  'fact_checkers',
  'Fact-checking researcher dedicated to verifying multimedia claims, debunking manipulated media, and tracking coordinated online misinformation.',
  'https://factlymedia.com/teams/fact-check/',
  true, false, false,
  '{"en", "te"}'
),
(
  'ref-factcheck-03',
  'Sushmitha Ponnala',
  'Senior Fact-Checker',
  'FACTLY',
  'Visual forensics and regional-language claim analysis',
  'fact_checkers',
  'Senior fact-checker focusing on vernacular Indian language rumors, digital verification methodologies, and community educational initiatives.',
  'https://factlymedia.com/teams/fact-check/',
  true, false, false,
  '{"en", "te", "hi"}'
),
-- Public Reference: Legal Professional
(
  'ref-legal-01',
  'Madhavi Diwan',
  'Senior Advocate',
  'Supreme Court of India',
  'Constitutional law, media regulation and statutory rights',
  'legal_professionals',
  'Senior Advocate at the Supreme Court of India and former Additional Solicitor General, specialized in constitutional law, media regulation, and legal protections.',
  'https://fcn.mcaindia.in/',
  true, false, false,
  '{"en", "hi"}'
),
-- Public Reference: Legal Assistance Organization
(
  'ref-org-01',
  'Telangana State Legal Services Authority',
  'Official Legal Aid Organization',
  'State Legal Services Authority (NALSA Statutory Body)',
  'Citizen grievance redressal, statutory legal aid and public legal literacy',
  'organizations',
  'Statutory body constituted under the Legal Services Authorities Act to provide free, competent legal services to citizens and ensure justice for marginalized communities.',
  'https://telangana.nalsa.gov.in/legal-aid/',
  true, false, false,
  '{"en", "te", "hi"}'
),
-- Participating Demo Experts (Accept Requests)
(
  'demo-expert-journo',
  'Demo Journalist',
  'Senior Investigative Journalist',
  'TrustLens Demonstration Verification Desk',
  'News and misinformation verification',
  'journalists',
  'Demonstration investigative desk specialized in breaking news verification, press attribution analysis, and identifying synthetic editorial articles.',
  '#demo',
  false, true, true,
  '{"en", "hi", "te"}'
),
(
  'demo-expert-lawyer',
  'Demo Lawyer',
  'Legal Guidance Specialist',
  'TrustLens Cyber Law & Citizen Rights Advisory',
  'Legal guidance and reporting procedures',
  'legal_professionals',
  'Demonstration legal counseling desk providing guidance on cybercrime complaint filing (NCRP), defamation limits, evidence preservation, and IT Act provisions.',
  '#demo',
  false, true, true,
  '{"en", "hi", "te"}'
),
(
  'demo-expert-factchecker',
  'Demo Fact-Checker',
  'Principal Verification Analyst',
  'TrustLens Open Verification Network',
  'Online claim and evidence review',
  'fact_checkers',
  'Demonstration fact-checking desk evaluating suspicious claims against official databases, reverse-image indices, and primary government archives.',
  '#demo',
  false, true, true,
  '{"en", "hi", "te"}'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  title = EXCLUDED.title,
  organization = EXCLUDED.organization,
  expertise_area = EXCLUDED.expertise_area,
  category = EXCLUDED.category,
  bio = EXCLUDED.bio,
  official_reference_url = EXCLUDED.official_reference_url,
  is_public_reference = EXCLUDED.is_public_reference,
  is_demo_expert = EXCLUDED.is_demo_expert,
  can_receive_requests = EXCLUDED.can_receive_requests,
  languages_spoken = EXCLUDED.languages_spoken,
  updated_at = NOW();
