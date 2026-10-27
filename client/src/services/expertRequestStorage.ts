import { DEFAULT_EXPERTS } from '../data/defaultExperts.js';

export interface StoredExpertRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  expert_id: string;
  expert_name: string;
  expert_title: string;
  expert_organization: string;
  expert_category: string;
  category: string;
  subject: string;
  description: string;
  preferred_language: string;
  attachment_url: string | null;
  status: 'pending' | 'in_review' | 'completed' | 'declined';
  decline_reason?: string | null;
  response_text?: string | null;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: string;
    sender_type: 'user' | 'expert';
    sender_name: string;
    message_text: string;
    created_at: string;
  }>;
}

const STORAGE_KEY = 'trustlens_expert_requests';

// Initial preloaded seed requests for seamless demo testing
const INITIAL_DEMO_REQUESTS: StoredExpertRequest[] = [
  {
    id: 'req-demo-01',
    user_id: 'demo_user_01',
    user_name: 'Citizen Investigator',
    user_email: 'investigator@trustlens.org',
    expert_id: 'demo-expert-journo',
    expert_name: 'Demo Journalist',
    expert_title: 'Senior Investigative Journalist',
    expert_organization: 'TrustLens Demonstration Verification Desk',
    expert_category: 'journalists',
    category: 'Misinformation Verification',
    subject: 'Viral press statement attributed to Election Commission',
    description: 'A circulated image claims that voting dates for phase 4 were postponed by two weeks. The circular uses official headers but lacks an official notification number.',
    preferred_language: 'en',
    attachment_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
    status: 'completed',
    response_text: 'Our verification desk cross-referenced the alleged press release against the Election Commission of India official gazette portal. No such postponement notification exists. The document is a digital fabrication reusing a 2019 header template with modified dates.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    messages: [
      {
        id: 'msg-demo-01',
        sender_type: 'user',
        sender_name: 'Citizen Investigator',
        message_text: 'Please review whether this circulated circular was officially issued by the Commission.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'msg-demo-02',
        sender_type: 'expert',
        sender_name: 'Demo Journalist',
        message_text: 'Our verification desk cross-referenced the alleged press release against the Election Commission of India official gazette portal. No such postponement notification exists. The document is a digital fabrication reusing a 2019 header template with modified dates.',
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
  },
  {
    id: 'req-demo-02',
    user_id: 'demo_user_01',
    user_name: 'Citizen Investigator',
    user_email: 'investigator@trustlens.org',
    expert_id: 'demo-expert-factchecker',
    expert_name: 'Demo Fact-Checker',
    expert_title: 'Principal Verification Analyst',
    expert_organization: 'TrustLens Open Verification Network',
    expert_category: 'fact_checkers',
    category: 'Digital Forensics',
    subject: 'Manipulated video of flood rescue in Himachal Pradesh',
    description: 'Viral clip on X/Telegram claiming sudden cloudburst in Shimla. Visual lighting looks inconsistent with recent weather reports.',
    preferred_language: 'en',
    attachment_url: null,
    status: 'in_review',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'msg-demo-03',
        sender_type: 'user',
        sender_name: 'Citizen Investigator',
        message_text: 'Please run keyframe reverse search to check original origin date of this clip.',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ],
  },
];

export function getStoredRequests(expertRoleFilter?: string): StoredExpertRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REQUESTS));
      return filterByExpert(INITIAL_DEMO_REQUESTS, expertRoleFilter);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REQUESTS));
      return filterByExpert(INITIAL_DEMO_REQUESTS, expertRoleFilter);
    }
    return filterByExpert(parsed, expertRoleFilter);
  } catch {
    return filterByExpert(INITIAL_DEMO_REQUESTS, expertRoleFilter);
  }
}

function filterByExpert(requests: StoredExpertRequest[], roleFilter?: string): StoredExpertRequest[] {
  if (!roleFilter || roleFilter === 'user' || roleFilter === 'all') {
    return requests;
  }
  const roleMap: Record<string, string> = {
    journalist: 'journalists',
    lawyer: 'legal_professionals',
    'fact-checker': 'fact_checkers',
    journalists: 'journalists',
    legal_professionals: 'legal_professionals',
    fact_checkers: 'fact_checkers',
  };
  const targetCategory = roleMap[roleFilter] || roleFilter;
  return requests.filter(
    (r) => r.expert_category === targetCategory || r.expert_id.includes(roleFilter.toLowerCase())
  );
}

export function saveStoredRequest(request: Partial<StoredExpertRequest>): StoredExpertRequest {
  const current = getStoredRequests();
  const matchedExpert = DEFAULT_EXPERTS.find((e) => e.id === request.expert_id);

  const newRecord: StoredExpertRequest = {
    id: request.id || `req-${Date.now()}`,
    user_id: request.user_id || localStorage.getItem('trustlens_dev_user_id') || 'demo_user_01',
    user_name: request.user_name || 'Citizen Investigator',
    user_email: request.user_email || 'investigator@trustlens.org',
    expert_id: request.expert_id || 'demo-expert-journo',
    expert_name: matchedExpert?.full_name || request.expert_name || 'Assigned Expert Desk',
    expert_title: matchedExpert?.title || request.expert_title || 'Verification Specialist',
    expert_organization: matchedExpert?.organization || request.expert_organization || 'TrustLens Verification Network',
    expert_category: matchedExpert?.category || request.expert_category || 'journalists',
    category: request.category || 'Misinformation Verification',
    subject: request.subject || 'Verification Inquiry',
    description: request.description || '',
    preferred_language: request.preferred_language || 'en',
    attachment_url: request.attachment_url || null,
    status: request.status || 'pending',
    decline_reason: request.decline_reason || null,
    response_text: request.response_text || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: request.messages || [
      {
        id: `msg-${Date.now()}`,
        sender_type: 'user',
        sender_name: request.user_name || 'Citizen Investigator',
        message_text: request.description || 'Request initiated.',
        created_at: new Date().toISOString(),
      },
    ],
  };

  const updated = [newRecord, ...current.filter((r) => r.id !== newRecord.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newRecord;
}

export function updateStoredRequest(
  requestId: string,
  updates: Partial<StoredExpertRequest> & { action?: string; responseText?: string; reason?: string }
): StoredExpertRequest | null {
  const current = getStoredRequests();
  const index = current.findIndex((r) => r.id === requestId);
  if (index === -1) return null;

  const item = { ...current[index] };
  item.updated_at = new Date().toISOString();

  if (updates.action === 'accept') {
    item.status = 'in_review';
  } else if (updates.action === 'decline') {
    item.status = 'declined';
    item.decline_reason = updates.reason || updates.decline_reason || 'Out of statutory review jurisdiction.';
  } else if (updates.action === 'reply' && updates.responseText) {
    item.status = 'completed';
    item.response_text = updates.responseText;
    item.messages.push({
      id: `msg-${Date.now()}`,
      sender_type: 'expert',
      sender_name: item.expert_name || 'Desk Expert',
      message_text: updates.responseText,
      created_at: new Date().toISOString(),
    });
  }

  // Merge any direct fields
  if (updates.status) item.status = updates.status;
  if (updates.response_text) item.response_text = updates.response_text;
  if (updates.decline_reason) item.decline_reason = updates.decline_reason;

  current[index] = item;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return item;
}
