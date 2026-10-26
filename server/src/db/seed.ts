import { db } from './index.js';
import bcrypt from 'bcryptjs';

export function seedInitialData() {
  // Always seed expert profiles if empty
  seedExpertProfiles();

  // Check if reporting resources exist
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM reporting_resources');
  const result = countStmt.get() as { count: number };
  if (result && result.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial verified resources, lessons, experts, and accounts...');

  // 1. Create Default Admin & Analyst Users
  const passwordHash = bcrypt.hashSync('trustlens123', 10);

  const insertProfile = db.prepare(`
    INSERT OR IGNORE INTO profiles (id, email, password_hash, display_name, role, preferred_language, intended_use)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = 'usr-admin-001';
  const analystId = 'usr-analyst-001';
  const expertUserId = 'usr-expert-001';

  insertProfile.run(adminId, 'admin@trustlens.org', passwordHash, 'System Administrator', 'admin', 'en', 'community_moderation');
  insertProfile.run(analystId, 'analyst@trustlens.org', passwordHash, 'Senior Analyst', 'analyst', 'en', 'journalism');
  insertProfile.run(expertUserId, 'dr.sharma@trustlens.org', passwordHash, 'Dr. Aruna Sharma', 'expert', 'te', 'academic_research');

  // Insert Preferences
  const insertPref = db.prepare(`
    INSERT OR IGNORE INTO user_preferences (user_id, theme, email_notifications, in_app_notifications)
    VALUES (?, ?, 1, 1)
  `);
  insertPref.run(adminId, 'light');
  insertPref.run(analystId, 'light');
  insertPref.run(expertUserId, 'light');

  // 2. Real Reporting Resources
  const insertResource = db.prepare(`
    INSERT INTO reporting_resources (id, title, category, jurisdiction, official_url, description, handling_process, verified_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertResource.run(
    'res-001',
    'National Cyber Crime Reporting Portal (NCRP)',
    'cybercrime',
    'India (National)',
    'https://cybercrime.gov.in',
    'Official Ministry of Home Affairs portal for reporting cyber financial fraud, impersonation, online abuse, and malicious digital content.',
    'Victims can register complaints online or dial toll-free 1930. Complaints are directly forwarded to the relevant state police cyber cell for formal FIR lodging.',
    '2026-03-01'
  );

  insertResource.run(
    'res-002',
    'PIB Fact Check Unit (Press Information Bureau)',
    'government',
    'India (Union Government)',
    'https://factcheck.pib.gov.in',
    'Official unit under the Ministry of Information & Broadcasting dedicated to debunking rumors regarding Government of India schemes, policies, and notifications.',
    'Citizens can submit suspicious forwards via WhatsApp (+91 8799711259) or email (pibfactcheck@gmail.com). Official rebuttals are released with press releases.',
    '2026-03-15'
  );

  insertResource.run(
    'res-003',
    'Election Commission of India — cVIGIL & Grievance Portal',
    'government',
    'India (Elections)',
    'https://cvigil.eci.gov.in',
    'Direct citizen reporting channel for electoral misinformation, voter suppression claims, hate speech, and model code violations.',
    'Submissions receive automated geo-tagging. Flying squad teams must investigate and respond within 100 minutes during election periods.',
    '2026-02-20'
  );

  insertResource.run(
    'res-004',
    'WhatsApp India Grievance Officer & Fact-Checking Helpline',
    'social_media',
    'India / Global',
    'https://www.whatsapp.com/contact',
    'Statutory grievance mechanism under Information Technology (Intermediary Guidelines) Rules 2021 for reporting illegal viral content, scams, and group harassment.',
    'Complaints submitted to the Resident Grievance Officer must be acknowledged within 24 hours and addressed within 15 days.',
    '2026-03-10'
  );

  insertResource.run(
    'res-005',
    'Indian Computer Emergency Response Team (CERT-In)',
    'cybercrime',
    'India (Cybersecurity)',
    'https://www.cert-in.org.in',
    'National nodal agency for incident response regarding phishing campaigns, ransomware, fake banking domains, and national cyber incidents.',
    'Incidents are reported via incident@cert-in.org.in or 1800-11-4949. Technical advisories are issued publicly.',
    '2026-03-05'
  );

  insertResource.run(
    'res-006',
    'Press Council of India (PCI)',
    'media_ethics',
    'India (Print Media)',
    'https://presscouncil.nic.in',
    'Statutory quasi-judicial body regulating ethics in journalism and adjudicating complaints against fake or defamatory published news.',
    'Formal complaints are heard by the Inquiry Committee under the Press Council Act 1978.',
    '2026-01-18'
  );

  // 3. Educational Lessons
  const insertLesson = db.prepare(`
    INSERT INTO educational_lessons (id, slug, title, category, reading_time_mins, content_markdown, quiz_json, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLesson.run(
    'les-001',
    'spotting-forwarded-rumors',
    'Anatomy of a Viral Forward: Red Flags and Verification Habits',
    'Language & Structure',
    4,
    `### Why Misinformation Spreads in Chat Apps

Forwarded messages on platforms like WhatsApp and Telegram exploit human trust. Because they arrive from family, friends, or trusted community groups, our natural critical defenses are lowered.

#### Key Structural Red Flags

1. **Artificial Urgency:** Phrases like *"FORWARD TO EVERY GROUP IMMEDIATELY"*, *"BEFORE TOMORROW MIDNIGHT"*, or *"MAIN STREAM MEDIA IS HIDING THIS"*.
2. **Vague Attribution:** Phrases such as *"According to NASA scientists"* or *"A senior doctor from AIIMS warned"* without a specific named researcher, institution branch, or published press release.
3. **Emotional Amplification:** Deliberate triggering of intense emotions—fear, anger, pride, or disgust. If a message causes an immediate urge to react, pause for 60 seconds.
4. **Altered Typography:** ALL CAPS headline text, excessive exclamation points (!!!), random emojis, and broken formatting indicating multi-stage copy-pasting.

#### The 3-Step Verification Checklist

- **Step 1:** Search the core factual claim in Google or Bing enclosed in quotation marks alongside the word "fact check".
- **Step 2:** Check official portals (e.g., PIB Fact Check, WHO, RBI, or local authorities).
- **Step 3:** If you cannot verify it within 2 minutes, **do not forward it**. Breaking the chain stops viral panic.`,
    JSON.stringify([
      {
        question: 'Which of the following is a classic indicator of emotional manipulation in a message?',
        options: [
          'Detailed citations linking to peer-reviewed scientific journals',
          'Urgent demands to share before the content is deleted or midnight arrives',
          'A calm statement with dates and contact numbers for the public relations office',
          'A neutral summary with multiple verifiable sources'
        ],
        answerIndex: 1,
        explanation: 'Manufactured urgency is designed to bypass your logical reflection and trigger rapid forwarding.'
      },
      {
        question: 'What is the most responsible action if you receive a shocking claim with no verifiable source?',
        options: [
          'Forward it to all your contacts with the note "forwarded as received"',
          'Ignore checking and post it on social media to see if others agree',
          'Pause, do not forward, and check independent fact-checking databases',
          'Assume it must be true if your close friend sent it'
        ],
        answerIndex: 2,
        explanation: 'Pausing and refusing to amplify unverified content is the most effective digital defense.'
      }
    ]),
    1
  );

  insertLesson.run(
    'les-002',
    'reverse-image-investigation',
    'Visual Forensics: Reverse Image Search and Out-of-Context Media',
    'Visual Verification',
    6,
    `### How Images are Re-Purposed to Mislead

Over 70% of viral visual misinformation does not involve sophisticated deepfakes; rather, it uses genuine old photographs or videos mislabeled with modern, false captions.

#### Identifying Recycled Visuals

1. **Reverse Image Search:** Upload the screenshot or image to Google Lens, Yandex Images, or TinEye. Check the earliest index date. If a photo claimed to be from yesterday was already online in 2018, the caption is debunked.
2. **Look for Inconsistencies:**
   - Weather and season vs. claimed date.
   - Vehicle license plates, street signs, and script languages.
   - Uniforms and logos of emergency services or police.
3. **AI Generation Artifacts:**
   - Unnatural hands (extra fingers, fused digits).
   - Warped backgrounds, non-repeating symmetrical patterns.
   - Text on signs with gibberish lettering.
   - Unrealistic glossy skin texture or lighting direction mismatches.`,
    JSON.stringify([
      {
        question: 'What is "cheapfake" or out-of-context media?',
        options: [
          'A $10,000 deepfake video produced by a Hollywood studio',
          'A real photograph from a past event presented with a misleading new caption',
          'A low-resolution photo taken with an old camera',
          'An encrypted image file'
        ],
        answerIndex: 1,
        explanation: 'Cheapfakes repurpose existing authentic photos or clips under false dates and locations.'
      }
    ]),
    2
  );

  insertLesson.run(
    'les-003',
    'evaluating-credible-sources',
    'Evaluating Source Credibility: Primary vs. Secondary Evidence',
    'Media Literacy',
    5,
    `### Hierarchy of Information Reliability

When evaluating a disputed factual claim, not all links carry equal evidentiary weight.

#### The Source Credibility Ladder

1. **Level 1 — Primary Source:** Official government gazettes, court orders, peer-reviewed scientific studies, direct press releases on verified agency domains (.gov.in, .org, official corporate newsrooms).
2. **Level 2 — Reputable Investigative Outlets:** Newsrooms with published editorial codes, transparent corrections policies, and named bylines (Reuters, PTI, BBC, The Hindu, Indian Express).
3. **Level 3 — Verified Fact-Checkers:** IFCN (International Fact-Checking Network) signatories adhering to strict standards of non-partisanship and source transparency.
4. **Level 4 — Commentary and Opinion:** Editorials, personal blogs, influencer threads, and unverified social media handles.`,
    JSON.stringify([
      {
        question: 'What distinguishes an IFCN-certified fact-checking organization?',
        options: [
          'They only publish positive news',
          'They adhere to a strict public code of non-partisanship, methodological transparency, and open corrections',
          'They are owned by government ministries',
          'They use AI to automatically block accounts'
        ],
        answerIndex: 1,
        explanation: 'IFCN signatories must demonstrate rigorous independence, source citation, and a transparent corrections policy.'
      }
    ]),
    3
  );

  // 4. Verified Expert Profiles (Original)
  const insertExpert = db.prepare(`
    INSERT INTO experts (id, user_id, full_name, expertise_area, bio, organization, verification_status, languages_spoken, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, 'verified', ?, ?)
  `);

  insertExpert.run(
    'exp-001',
    expertUserId,
    'Dr. Aruna Sharma',
    'Digital Forensics & OSINT',
    'Associate Professor of Information Security with 12 years of research into synthetic media detection and regional-language misinformation forensics.',
    'Centre for Digital Media Integrity',
    '["en", "te", "hi"]',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  );

  insertExpert.run(
    'exp-002',
    analystId,
    'Rajesh V. Nambiar',
    'Investigative Journalism & Fact-Checking',
    'Former senior investigative correspondent and certified fact-checker specializing in public health claims, fiscal data, and election transparency.',
    'Independent Press Alliance',
    '["en", "hi"]',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );

  insertExpert.run(
    'exp-003',
    null,
    'Prof. K. Venkateswarlu',
    'Linguistics & Regional Dialect Semantics',
    'Specialist in Indian vernacular discourse, dialectal semantic framing, and social media rumor propagation in Telugu and South Indian languages.',
    'Department of Applied Linguistics',
    '["te", "en"]',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  );


  // 5. Initial Sample Verified Analysis for Demo Continuity
  const insertAnalysis = db.prepare(`
    INSERT INTO analyses (id, user_id, input_type, original_input, extracted_text, detected_language, risk_level, risk_score, uncertainty_rating, summary, methodology, status, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 1)
  `);

  const demoAnalysisId = 'ana-demo-001';
  insertAnalysis.run(
    demoAnalysisId,
    analystId,
    'text',
    'Breaking: Indian Space Research Organisation (ISRO) successfully completes landing demonstration of Reusable Launch Vehicle (RLV-LEX-02) in Chitradurga, Karnataka.',
    'Breaking: Indian Space Research Organisation (ISRO) successfully completes landing demonstration of Reusable Launch Vehicle (RLV-LEX-02) in Chitradurga, Karnataka.',
    'en',
    'lower_risk',
    12,
    'low',
    'The claim aligns with official releases from the Indian Space Research Organisation (ISRO) and validated reporting from major national news agencies. No sensationalist or urgent forwarding signals detected.',
    'Automated linguistic analysis followed by retrieval against national press agency records and official agency press releases.',
  );

  const insertAnalysisClaim = db.prepare(`
    INSERT INTO analysis_claims (id, analysis_id, claim_text, position, assessment, verification_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertAnalysisClaim.run(
    'clm-demo-001',
    demoAnalysisId,
    'ISRO completed the landing experiment of RLV-LEX-02 in Chitradurga.',
    1,
    'Supported by official press releases and photographic evidence from ISRO.',
    'verified_supported'
  );

  const insertIndicator = db.prepare(`
    INSERT INTO risk_indicators (id, analysis_id, indicator_name, indicator_category, observed_snippet, explanation, limitation, severity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertIndicator.run(
    'ind-demo-001',
    demoAnalysisId,
    'Factual Attribution & Specificity',
    'Source Attribution',
    'ISRO... Chitradurga, Karnataka',
    'Message names precise institutions, location coordinates, and test mission designations (RLV-LEX-02) which enables direct external corroboration.',
    'Detailed technical names can occasionally be fabricated, but allow targeted verification.',
    'low'
  );

  const insertEvidence = db.prepare(`
    INSERT INTO evidence_sources (id, analysis_id, claim_id, title, publisher, url, excerpt, source_type, stance, published_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertEvidence.run(
    'evi-demo-001',
    demoAnalysisId,
    'clm-demo-001',
    'ISRO accomplishes Autonomous Landing Mission of Reusable Launch Vehicle RLV LEX-02',
    'Indian Space Research Organisation (Official)',
    'https://www.isro.gov.in/RLV_LEX_02.html',
    'ISRO successfully conducted the RLV-LEX-02 landing experiment at the Aeronautical Test Range (ATR), Chitradurga, Karnataka on March 22, demonstrating autonomous landing capability under simulated space return conditions.',
    'official_agency',
    'supports',
    '2024-03-22'
  );

  // 6. Seed a Community Claim
  const insertCommunity = db.prepare(`
    INSERT INTO community_claims (id, user_id, analysis_id, title, claim_text, summary, status, upvotes, downvotes)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);
  insertCommunity.run(
    'com-001',
    analystId,
    demoAnalysisId,
    'ISRO RLV-LEX-02 Autonomous Landing Experiment Verification',
    'Breaking: Indian Space Research Organisation (ISRO) successfully completes landing demonstration of Reusable Launch Vehicle (RLV-LEX-02) in Chitradurga, Karnataka.',
    'Corroborated by official agency releases and independent aerospace reporting.',
    28,
    1
  );

  console.log('Seeding completed successfully.');
}

export function seedExpertProfiles() {
  const count = (db.prepare('SELECT COUNT(*) as count FROM expert_profiles').get() as any)?.count || 0;
  if (count > 0) return;

  console.log('Seeding expert_profiles directory and public references...');
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO expert_profiles (
      id, full_name, title, organization, expertise_area, category, bio, official_reference_url, is_public_reference, is_demo_expert, can_receive_requests, languages_spoken
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Public References: Journalists
  insertProfile.run(
    'ref-journo-01',
    'Jency Jacob',
    'Managing Editor',
    'BOOM',
    'Journalism and misinformation verification',
    'journalists',
    'Senior journalist and Managing Editor at BOOM Live with extensive experience tracking media manipulation, fact-checking viral claims, and training newsrooms across India.',
    'https://www.boomlive.in/boom-team',
    1, 0, 0,
    '["en", "hi"]'
  );

  insertProfile.run(
    'ref-journo-02',
    'Adrija Bose',
    'Senior Editor',
    'BOOM',
    'Digital misinformation and investigative journalism',
    'journalists',
    'Investigative journalist and Senior Editor specializing in gender-based disinformation, social platform rumor dynamics, and digital forensics verification.',
    'https://www.boomlive.in/boom-team',
    1, 0, 0,
    '["en", "hi", "bn"]'
  );

  // Public References: Fact-Checkers
  insertProfile.run(
    'ref-factcheck-01',
    'Akshay Kumar Appani',
    'Lead, Fact Checking & Research',
    'FACTLY',
    'Fact verification, public policy analysis and open data research',
    'fact_checkers',
    'Lead researcher at FACTLY specializing in public policy claims, government gazette cross-referencing, and viral social media narrative investigations.',
    'https://factlymedia.com/teams/fact-check/',
    1, 0, 0,
    '["en", "te", "hi"]'
  );

  insertProfile.run(
    'ref-factcheck-02',
    'Harshavardhan Konda',
    'Lead Fact-Checker',
    'FACTLY',
    'Digital claim verification & open-source intelligence (OSINT)',
    'fact_checkers',
    'Fact-checking researcher dedicated to verifying multimedia claims, debunking manipulated media, and tracking coordinated online misinformation.',
    'https://factlymedia.com/teams/fact-check/',
    1, 0, 0,
    '["en", "te"]'
  );

  insertProfile.run(
    'ref-factcheck-03',
    'Sushmitha Ponnala',
    'Senior Fact-Checker',
    'FACTLY',
    'Visual forensics and regional-language claim analysis',
    'fact_checkers',
    'Senior fact-checker focusing on vernacular Indian language rumors, digital verification methodologies, and community educational initiatives.',
    'https://factlymedia.com/teams/fact-check/',
    1, 0, 0,
    '["en", "te", "hi"]'
  );

  // Public Reference: Legal Professional
  insertProfile.run(
    'ref-legal-01',
    'Madhavi Diwan',
    'Senior Advocate',
    'Supreme Court of India',
    'Constitutional law, media regulation and statutory rights',
    'legal_professionals',
    'Senior Advocate at the Supreme Court of India and former Additional Solicitor General, specialized in constitutional law, media regulation, and legal protections.',
    'https://fcn.mcaindia.in/',
    1, 0, 0,
    '["en", "hi"]'
  );

  // Public Reference: Legal Assistance Organization
  insertProfile.run(
    'ref-org-01',
    'Telangana State Legal Services Authority',
    'Official Legal Aid Organization',
    'State Legal Services Authority (NALSA Statutory Body)',
    'Citizen grievance redressal, statutory legal aid and public legal literacy',
    'organizations',
    'Statutory body constituted under the Legal Services Authorities Act to provide free, competent legal services to citizens and ensure justice for marginalized communities.',
    'https://telangana.nalsa.gov.in/legal-aid/',
    1, 0, 0,
    '["en", "te", "hi"]'
  );

  // Participating Demo Experts (Accept Requests)
  insertProfile.run(
    'demo-expert-journo',
    'Demo Journalist',
    'Senior Investigative Journalist',
    'TrustLens Demonstration Verification Desk',
    'News and misinformation verification',
    'journalists',
    'Demonstration investigative desk specialized in breaking news verification, press attribution analysis, and identifying synthetic editorial articles.',
    '#demo',
    0, 1, 1,
    '["en", "hi", "te"]'
  );

  insertProfile.run(
    'demo-expert-lawyer',
    'Demo Lawyer',
    'Legal Guidance Specialist',
    'TrustLens Cyber Law & Citizen Rights Advisory',
    'Legal guidance and reporting procedures',
    'legal_professionals',
    'Demonstration legal counseling desk providing guidance on cybercrime complaint filing (NCRP), defamation limits, evidence preservation, and IT Act provisions.',
    '#demo',
    0, 1, 1,
    '["en", "hi", "te"]'
  );

  insertProfile.run(
    'demo-expert-factchecker',
    'Demo Fact-Checker',
    'Principal Verification Analyst',
    'TrustLens Open Verification Network',
    'Online claim and evidence review',
    'fact_checkers',
    'Demonstration fact-checking desk evaluating suspicious claims against official databases, reverse-image indices, and primary government archives.',
    '#demo',
    0, 1, 1,
    '["en", "hi", "te"]'
  );

  console.log('Seeded 10 expert profiles successfully.');
}
