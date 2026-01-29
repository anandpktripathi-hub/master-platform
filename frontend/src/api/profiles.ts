import api from './client';

export interface PublicProfile {
  _id: string;
  handle: string;
  headline?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  currentTitle?: string;
  currentCompanyName?: string;
  skills?: string[];
  visibility: 'PUBLIC' | 'NETWORK' | 'PRIVATE';
  isComplete: boolean;
}

export async function getMyPublicProfile() {
  return api.get<PublicProfile>('/me/public-profile');
}

export async function updateMyPublicProfile(payload: Partial<PublicProfile>) {
  return api.put<PublicProfile>('/me/public-profile', payload);
}

export async function getPublicProfile(handle: string) {
  return api.get<PublicProfile>(`/public/profiles/${encodeURIComponent(handle)}`);
}

export async function checkHandleAvailability(handle: string) {
  return api.get<{ available: boolean }>(`/public/profiles/check-handle?handle=${encodeURIComponent(handle)}`);
}
