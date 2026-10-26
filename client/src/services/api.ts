const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('trustlens_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('trustlens_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('trustlens_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If no token or in dev mode, attach stored dev headers if available
  const devUserId = localStorage.getItem('trustlens_dev_user_id');
  if (devUserId && !token) {
    headers.set('x-dev-user-id', devUserId);
  }
  const devExpertRole = localStorage.getItem('trustlens_dev_expert_role');
  if (devExpertRole) {
    headers.set('x-dev-expert-role', devExpertRole);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiRequest('/auth/me'),
  onboarding: (body: any) => apiRequest('/auth/onboarding', { method: 'POST', body: JSON.stringify(body) }),

  // Analyses
  createAnalysis: (body: any) => apiRequest('/analyses', { method: 'POST', body: JSON.stringify(body) }),
  getAnalyses: (params: string = '') => apiRequest(`/analyses${params}`),
  getAnalysisById: (id: string) => apiRequest(`/analyses/${id}`),
  deleteAnalysis: (id: string) => apiRequest(`/analyses/${id}`, { method: 'DELETE' }),
  previewUrl: (url: string) => apiRequest('/analyses/url-preview', { method: 'POST', body: JSON.stringify({ url }) }),
  submitFeedback: (id: string, body: any) => apiRequest(`/analyses/${id}/feedback`, { method: 'POST', body: JSON.stringify(body) }),

  // OCR
  uploadOcrImage: (formData: FormData) => apiRequest('/ocr', { method: 'POST', body: formData }),

  // Assistant
  askAssistant: (body: any) => apiRequest('/assistant/chat', { method: 'POST', body: JSON.stringify(body) }),

  // Community
  getCommunityClaims: (params: string = '') => apiRequest(`/community/claims${params}`),
  createCommunityClaim: (body: any) => apiRequest('/community/claims', { method: 'POST', body: JSON.stringify(body) }),
  getCommunityClaimById: (id: string) => apiRequest(`/community/claims/${id}`),
  postComment: (claimId: string, body: any) => apiRequest(`/community/claims/${claimId}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  voteClaim: (claimId: string, voteType: 'helpful' | 'unhelpful') => apiRequest(`/community/claims/${claimId}/vote`, { method: 'POST', body: JSON.stringify({ voteType }) }),
  reportClaim: (claimId: string, body: any) => apiRequest(`/community/claims/${claimId}/report`, { method: 'POST', body: JSON.stringify(body) }),

  // Experts Directory & Requests
  getExperts: (params: string = '') => apiRequest(`/experts${params}`),
  createExpertRequest: (body: any) => apiRequest('/experts/requests', { method: 'POST', body: JSON.stringify(body) }),
  getExpertRequests: (params: string = '') => apiRequest(`/experts/requests${params}`),
  getExpertRequestById: (id: string) => apiRequest(`/experts/requests/${id}`),
  updateExpertRequest: (id: string, body: any) => apiRequest(`/experts/requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  submitExpertReview: (body: any) => apiRequest('/experts/reviews', { method: 'POST', body: JSON.stringify(body) }),
  getExpertReviews: () => apiRequest('/experts/reviews'),
  updateExpertReview: (id: string, body: any) => apiRequest(`/experts/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Resources
  getResources: (params: string = '') => apiRequest(`/reporting-resources${params}`),
  reportBrokenResource: (body: any) => apiRequest('/reporting-resources/report-broken', { method: 'POST', body: JSON.stringify(body) }),

  // Education
  getLessons: () => apiRequest('/education/lessons'),
  getLessonBySlug: (slug: string) => apiRequest(`/education/lessons/${slug}`),
  saveLessonProgress: (id: string, score: number) => apiRequest(`/education/lessons/${id}/progress`, { method: 'POST', body: JSON.stringify({ quizScore: score }) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/mark-all-read', { method: 'POST' }),

  // Profile
  getProfile: () => apiRequest('/profile'),
  updateProfile: (body: any) => apiRequest('/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  exportData: () => apiRequest('/profile/export'),
  deleteAccount: () => apiRequest('/profile', { method: 'DELETE' }),

  // Admin
  getAdminUsers: () => apiRequest('/admin/users'),
  updateUserRole: (id: string, role: string) => apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  getAdminReports: () => apiRequest('/admin/reports'),
  moderateReport: (id: string, body: any) => apiRequest(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminAuditLogs: () => apiRequest('/admin/audit-logs'),
  getAdminHealth: () => apiRequest('/admin/health'),
};
