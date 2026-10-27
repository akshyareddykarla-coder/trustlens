export interface ExpertProfile {
  id: string;
  full_name: string;
  title: string;
  organization: string;
  expertise_area: string;
  category: 'journalists' | 'fact_checkers' | 'legal_professionals' | 'organizations';
  bio: string;
  official_reference_url?: string;
  reference_url?: string;
  is_public_reference: boolean;
  is_demo_expert: boolean;
  can_receive_requests: boolean;
  languages_spoken: string[];
}

export const DEFAULT_EXPERTS: ExpertProfile[] = [
  // 1. Journalists - Public References
  {
    id: 'ref-journo-01',
    full_name: 'Jency Jacob',
    title: 'Managing Editor',
    organization: 'BOOM',
    expertise_area: 'Journalism and misinformation verification',
    category: 'journalists',
    bio: 'Senior journalist and Managing Editor at BOOM Live with extensive experience tracking media manipulation, fact-checking viral claims, and training newsrooms across India.',
    official_reference_url: 'https://www.boomlive.in/boom-team',
    reference_url: 'https://www.boomlive.in/boom-team',
    is_public_reference: true,
    is_demo_expert: false,
    can_receive_requests: false,
    languages_spoken: ['en', 'hi'],
  },
  {
    id: 'ref-journo-02',
    full_name: 'Adrija Bose',
    title: 'Senior Editor',
    organization: 'BOOM',
    expertise_area: 'Digital misinformation and investigative journalism',
    category: 'journalists',
    bio: 'Investigative journalist and Senior Editor specializing in gender-based disinformation, social platform rumor dynamics, and digital forensics verification.',
    official_reference_url: 'https://www.boomlive.in/boom-team',
    reference_url: 'https://www.boomlive.in/boom-team',
    is_public_reference: true,
    is_demo_expert: false,
    can_receive_requests: false,
    languages_spoken: ['en', 'hi', 'bn'],
  },

  // 2. Fact-Checkers - Public References
  {
    id: 'ref-factcheck-01',
    full_name: 'Akshay Kumar Appani',
    title: 'Lead, Fact Checking & Research',
    organization: 'FACTLY',
    expertise_area: 'Fact verification, public policy analysis and open data research',
    category: 'fact_checkers',
    bio: 'Lead researcher at FACTLY specializing in public policy claims, government gazette cross-referencing, and viral social media narrative investigations.',
    official_reference_url: 'https://factlymedia.com/teams/fact-check/',
    reference_url: 'https://factlymedia.com/teams/fact-check/',
    is_public_reference: true,
    is_demo_expert: false,
    can_receive_requests: false,
    languages_spoken: ['en', 'te', 'hi'],
  },
  {
    id: 'ref-factcheck-02',
    full_name: 'Harshavardhan Konda',
    title: 'Lead Fact-Checker',
    organization: 'FACTLY',
    expertise_area: 'Digital claim verification & open-source intelligence (OSINT)',
    category: 'fact_checkers',
    bio: 'Fact-checking researcher dedicated to verifying multimedia claims, debunking manipulated media, and tracking coordinated online misinformation.',
    official_reference_url: 'https://factlymedia.com/teams/fact-check/',
    reference_url: 'https://factlymedia.com/teams/fact-check/',
    is_public_reference: true,
    is_demo_expert: false,
    can_receive_requests: false,
    languages_spoken: ['en', 'te'],
  },
  {
    id: 'ref-factcheck-03',
    full_name: 'Sushmitha Ponnala',
    title: 'Senior Fact-Checker',
    organization: 'FACTLY',
    expertise_area: 'Visual forensics and regional-language claim analysis',
    category: 'fact_checkers',
    bio: 'Senior fact-checker focusing on vernacular Indian language rumors, digital verification methodologies, and community educational initiatives.',
    official_reference_url: 'https://factlymedia.com/teams/fact-check/',
    reference_url: 'https://factlymedia.com/teams/fact-check/',
    is_public_reference: true,
    is_demo_expert: false,
    can_receive_requests: false,
    languages_spoken: ['en', 'te', 'hi'],
  },

  // 3. Legal Professional - Public Reference
  {
    id: 'ref-legal-01',
    full_name: 'Madhavi Diwan',
    title: 'Senior Advocate',
    organization: 'Supreme Court of India',
    expertise_area: 'Constitutional law, media regulation and statutory rights',
    category: 'legal_professionals',
    bio: 'Senior Advocate at the Supreme Court of India and former Additional Solicitor General, specialized in constitutional law, media regulation, and statutory legal protections.',
    official_reference_url: 'https://fcn.mcaindia.in/',
    reference_url: 'https://fcn.mcaindia.in/',
    is_public_reference: true,
    is_demo_expert: false,
    can_receive_requests: false,
    languages_spoken: ['en', 'hi'],
  },

  // 4. Legal Assistance Organization - Public Reference
  {
    id: 'ref-org-01',
    full_name: 'Telangana State Legal Services Authority',
    title: 'Official Legal Aid Organization',
    organization: 'State Legal Services Authority (NALSA Statutory Body)',
    expertise_area: 'Citizen grievance redressal, statutory legal aid and public legal literacy',
    category: 'organizations',
    bio: 'Statutory body constituted under the Legal Services Authorities Act to provide free, competent legal services to citizens and ensure justice for marginalized communities.',
    official_reference_url: 'https://telangana.nalsa.gov.in/legal-aid/',
    reference_url: 'https://telangana.nalsa.gov.in/legal-aid/',
    is_public_reference: true,
    is_demo_expert: false,
    can_receive_requests: false,
    languages_spoken: ['en', 'te', 'hi'],
  },

  // 5. Participating Demo Desks (Accept Assistance Requests)
  {
    id: 'demo-expert-journo',
    full_name: 'Demo Journalist',
    title: 'Senior Investigative Journalist',
    organization: 'TrustLens Demonstration Verification Desk',
    expertise_area: 'News and misinformation verification',
    category: 'journalists',
    bio: 'Demonstration investigative desk specialized in breaking news verification, press attribution analysis, and identifying synthetic editorial articles.',
    official_reference_url: '#demo',
    reference_url: '#demo',
    is_public_reference: false,
    is_demo_expert: true,
    can_receive_requests: true,
    languages_spoken: ['en', 'hi', 'te'],
  },
  {
    id: 'demo-expert-lawyer',
    full_name: 'Demo Lawyer',
    title: 'Legal Guidance Specialist',
    organization: 'TrustLens Cyber Law & Citizen Rights Advisory',
    expertise_area: 'Legal guidance and reporting procedures',
    category: 'legal_professionals',
    bio: 'Demonstration legal counseling desk providing guidance on cybercrime complaint filing (NCRP), defamation limits, evidence preservation, and IT Act provisions.',
    official_reference_url: '#demo',
    reference_url: '#demo',
    is_public_reference: false,
    is_demo_expert: true,
    can_receive_requests: true,
    languages_spoken: ['en', 'hi', 'te'],
  },
  {
    id: 'demo-expert-factchecker',
    full_name: 'Demo Fact-Checker',
    title: 'Principal Verification Analyst',
    organization: 'TrustLens Open Verification Network',
    expertise_area: 'Online claim and evidence review',
    category: 'fact_checkers',
    bio: 'Demonstration fact-checking desk evaluating suspicious claims against official databases, reverse-image indices, and primary government archives.',
    official_reference_url: '#demo',
    reference_url: '#demo',
    is_public_reference: false,
    is_demo_expert: true,
    can_receive_requests: true,
    languages_spoken: ['en', 'hi', 'te'],
  },
];

export const DEFAULT_OFFICIAL_RESOURCES = [
  {
    id: 'res-ncrp',
    title: 'National Cyber Crime Reporting Portal (NCRP)',
    category: 'cybercrime',
    jurisdiction: 'India (National)',
    description: 'Ministry of Home Affairs statutory portal for reporting cyber fraud, impersonation, phishing, and non-consensual content sharing.',
    official_url: 'https://cybercrime.gov.in',
    handling_process: 'File formal cyber complaint online or dial 1930 for financial cyber fraud emergency freeze.',
    verified_date: '2026-10-25',
  },
  {
    id: 'res-pib',
    title: 'PIB Fact Check Unit',
    category: 'government',
    jurisdiction: 'India (Central Government)',
    description: 'Official Government of India fact-checking team verifying viral rumors, misleading government notices, and fake schemes.',
    official_url: 'https://factcheck.pib.gov.in',
    handling_process: 'Submit suspicious WhatsApp forwards or social posts to +91 8799711259 or pibfactcheck@gmail.com.',
    verified_date: '2026-10-25',
  },
  {
    id: 'res-eci',
    title: 'ECI National Grievance Redressal System',
    category: 'government',
    jurisdiction: 'Election Commission of India',
    description: 'Statutory portal for submitting electoral violations, deepfake campaign materials, and impersonation of election officers.',
    official_url: 'https://cvigil.eci.gov.in',
    handling_process: 'Use cVIGIL mobile app or web portal to submit geotagged photographic and video evidence.',
    verified_date: '2026-10-25',
  },
  {
    id: 'res-meta',
    title: 'WhatsApp India Grievance Redressal',
    category: 'social_media',
    jurisdiction: 'Intermediary Rules (IT Act 2021)',
    description: 'Statutory Grievance Officer channel for Meta/WhatsApp user grievances under Rule 3 of the Information Technology Rules.',
    official_url: 'https://www.whatsapp.com/contact/grievance-officer-india',
    handling_process: 'Submit registered mobile number, message screenshots, and timestamp logs directly to Grievance Desk.',
    verified_date: '2026-10-25',
  },
];
