import apiClient from './client';

export interface PublicBusinessSummary {
  _id: string;
  slug: string;
  name?: string;
  publicName?: string;
  tagline?: string;
  shortDescription?: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  categories?: string[];
  tags?: string[];
  planKey?: string;
  isActive: boolean;
  priceTier?: 'LOW' | 'MEDIUM' | 'HIGH';
  avgRating?: number;
  reviewCount?: number;
}

export interface PublicBusinessDetail extends PublicBusinessSummary {
  fullDescription?: string;
  websiteUrl?: string;
  contactEmailPublic?: string;
  contactPhonePublic?: string;
  coverImageUrl?: string;
}

export interface DirectoryFilter {
  q?: string;
  category?: string;
  city?: string;
  country?: string;
   tag?: string;
   priceTier?: 'LOW' | 'MEDIUM' | 'HIGH';
   minRating?: number;
}

export async function listPublicBusinesses(filter: DirectoryFilter = {}): Promise<PublicBusinessSummary[]> {
  const res = await apiClient.get('/tenants/public-directory', { params: filter });
  return res.data;
}

export async function getPublicBusinessBySlug(slug: string): Promise<PublicBusinessDetail> {
  const res = await apiClient.get(`/tenants/public/${slug}`);
  return res.data;
}

export interface BusinessReview {
  _id: string;
  tenantId: string;
  userId: string;
  rating: number;
  comment?: string;
  ownerReply?: string;
  createdAt: string;
}

export async function getBusinessReviews(slug: string): Promise<BusinessReview[]> {
  const res = await apiClient.get(`/tenants/public/${slug}/reviews`);
  return res.data;
}

export async function addBusinessReview(slug: string, rating: number, comment?: string) {
  const res = await apiClient.post(`/tenants/public/${slug}/reviews`, { rating, comment });
  return res.data;
}
