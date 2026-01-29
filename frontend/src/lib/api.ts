import type { LoginPayload } from '../contexts/AuthContext';

// ---------- Core Settings DTOs ----------

export interface BasicSettingsDto {
  siteTitle: string;
  siteTagLine: string;
  footerCopyright: string;
  siteLogo: string;
  siteWhiteLogo: string;
  siteFavicon: string;
}

export interface UpdateBasicSettingsDto extends BasicSettingsDto {}

export interface BrandingSettingsDto {
  siteLogo: string;
  siteWhiteLogo: string;
  favicon: string;
  logoDark: string;
  logoLight: string;
  brandFavicon: string;
  titleText: string;
  footerText: string;
  breadcrumbImageLeft: string;
  breadcrumbImageRight: string;
  mainHeroImage: string;
}

export type UpdateBrandingSettingsDto = BrandingSettingsDto;

export interface UiColorsLightSettingsDto {
// Ensure named export for BasicSettingsDto
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface UiColorsDarkSettingsDto {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface UiColorsCategoriesSettingsDto {
  [category: string]: {
    color: string;
    label: string;
  };
}

export interface UiTogglesSettingsDto {
  darkMode: boolean;
  compactMode: boolean;
  showSidebar: boolean;
}

export interface UiTypographySettingsDto {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
}

// Application / System settings

export interface ApplicationSettingsDto {
  appName: string;
  appTimezone: string;
  isLiveServer: boolean;
  appDebug: boolean;
  subscriptionExpiryWarningDays: number;
}

export type UpdateApplicationSettingsDto = ApplicationSettingsDto;

export interface SystemSettingsDto {
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  calendarStartDay: string;
  defaultTimezone: string;
}

export type UpdateSystemSettingsDto = SystemSettingsDto;

// Advanced settings DTOs (branding/pages/currency/seo/email/referral/reports)

export interface PagesSettingsDto {
  homePageId: string | null;
  pricingPageId: string | null;
  enableLandingPage: boolean;
  enableSignup: boolean;
  enableRTL: boolean;
  layoutDark: boolean;
  sidebarTransparent: boolean;
  categoryWiseSidemenu: boolean;
}

export type UpdatePagesSettingsDto = PagesSettingsDto;

export interface CurrencySettingsDto {
  decimalFormat: string;
  defaultCurrencyCode: string;
  decimalSeparator: 'dot' | 'comma';
  thousandSeparator: 'dot' | 'comma' | 'space' | 'none';
  floatNumberFormat: 'dot' | 'comma';
  currencySymbolSpace: 'with' | 'without';
  currencySymbolPosition: 'pre' | 'post';
  currencySymbolMode: 'symbol' | 'name';
}

export type UpdateCurrencySettingsDto = CurrencySettingsDto;

export interface SeoSettingsDto {
  metaTitle: string;
  metaTags: string[];
  metaKeywords: string[];
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalType?: string;
}

export type UpdateSeoSettingsDto = SeoSettingsDto;

export type SmtpEncryption = 'ssl' | 'tls' | 'none';

export interface EmailSettingsDto {
  globalFromEmail: string;
  smtpHost: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpDriver: string;
  smtpPort: number;
  smtpEncryption: SmtpEncryption;
}

export type UpdateEmailSettingsDto = EmailSettingsDto;

export interface ReferralSettingsDto {
  enabled: boolean;
  commissionPercent: number;
  minimumThresholdAmount: number;
  guidelines: string;
}

export type UpdateReferralSettingsDto = ReferralSettingsDto;

export interface ReportsSettingsDto {
  defaultStartMonthOffset: number;
  defaultStatusFilter: string[];
}

export type UpdateReportsSettingsDto = ReportsSettingsDto;

export interface NotificationChannelSettingsDto {
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

export interface NotificationSettingsDto {
  events: Record<string, NotificationChannelSettingsDto>;
  defaultEmailTemplatePrefix?: string;
}

export type UpdateNotificationSettingsDto = NotificationSettingsDto;

// Integration settings (Slack, Telegram, Twilio)

export interface SlackIntegrationSettingsDto {
  enabled: boolean;
  webhookUrl: string;
}

export interface TelegramIntegrationSettingsDto {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export interface TwilioIntegrationSettingsDto {
  enabled: boolean;
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface IntegrationSettingsDto {
  slack: SlackIntegrationSettingsDto;
  telegram: TelegramIntegrationSettingsDto;
  twilio: TwilioIntegrationSettingsDto;
}

export type UpdateIntegrationSettingsDto = IntegrationSettingsDto;

// Payment & IP restriction settings

export interface PaymentGatewayConfigDto {
  name: string; // e.g. "stripe", "paypal", "paystack", "bank_transfer"
  enabled: boolean;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  // Optional ISO currency codes this gateway supports directly (e.g. ["USD","EUR"]).
  supportedCurrencies?: string[];
  // Optional base currency for this gateway when conversions are needed (e.g. "USD").
  baseCurrency?: string;
  // Optional per-module toggles (packages, domains, etc.).
  modules?: Record<string, boolean>;
}

export interface PaymentSettingsDto {
  enablePayments: boolean;
  gateways: Record<string, PaymentGatewayConfigDto>;
}

export type UpdatePaymentSettingsDto = PaymentSettingsDto;

export interface IpRestrictionSettingsDto {
  enabled: boolean;
  allowedIps: string[];
}

export type UpdateIpRestrictionSettingsDto = IpRestrictionSettingsDto;

// In-app notifications

export interface UserNotificationDto {
  id?: string;
  _id?: string;
  eventKey: string;
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

// ---------- Chat DTOs ----------

export interface ChatRoomDto {
  _id: string;
  name: string;
  description?: string;
  isDefault: boolean;
   isPrivate?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  _id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoomMemberUserDto {
  _id: string;
  name?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface ChatRoomMemberDto {
  _id: string;
  userId: ChatRoomMemberUserDto;
  role: 'member' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// ---------- Developer Portal & Marketplace & AI & Domains DTOs ----------

export interface ApiKeySummaryDto {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface ApiKeyCreatedResponseDto {
  id: string;
  name: string;
  keyPrefix: string;
  rawKey: string;
  scopes: string[];
  expiresAt?: string | null;
  createdAt: string;
}

export interface CreateApiKeyRequestDto {
  name: string;
  scopes?: string[];
  expiresAt?: string | null;
}

export interface WebhookLogSummaryDto {
  id: string;
  event: string;
  url: string;
  status: string;
  responseStatus?: number | null;
  error?: string | null;
  attemptNumber: number;
  createdAt: string;
}

export interface WebhookLogListResponseDto {
  data: WebhookLogSummaryDto[];
  total: number;
  limit: number;
  skip: number;
}

export interface WebhookLogDetailDto {
  id: string;
  event: string;
  url: string;
  method: string;
  requestHeaders?: Record<string, unknown>;
  requestBody?: unknown;
  responseStatus?: number | null;
  responseHeaders?: Record<string, unknown>;
  responseBody?: unknown;
  status: string;
  error?: string | null;
  attemptNumber: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketplacePluginDto {
  pluginId: string;
  name: string;
  description?: string;
  iconUrl?: string;
  requiredScopes?: string[];
}

export interface TenantPluginInstallDto {
  id: string;
  pluginId: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  createdAt: string;
}

export interface AiCompletionRequestDto {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiCompletionResponseDto {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SentimentAnalysisResponseDto {
  sentiment: string;
  confidence: number;
}

export interface TenantDomainHealthSummaryDto {
  total: number;
  byStatus: Record<string, number>;
  ssl: {
    issued: number;
    pending: number;
    expired: number;
    expiringSoon: number;
    expiringList: Array<{
      domain: string;
      expiresAt: string;
      daysRemaining: number;
    }>;
  };
  primary: string | null;
}

export interface TenantCustomDomainDto {
  id?: string;
  _id?: string;
  tenantId: string;
  domain: string;
  status?: string;
  verificationToken?: string;
  verificationMethod?: string;
  dnsTarget?: string;
  dnsInstructions?: {
    method: string;
    target?: string;
    instructions: string[];
  };
  lastVerifiedAt?: string | null;
  sslStatus?: string;
  sslExpiresAt?: string | null;
  sslIssuedAt?: string | null;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  const workspaceId = localStorage.getItem("workspaceId");
  if (workspaceId) {
    config.headers = config.headers || {};
    // Workspace header is also treated as tenant override on the backend
    config.headers["x-workspace-id"] = workspaceId;
  }
  return config;
});

// Response interceptor: unwrap response.data and handle 401/403
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await authApi.refreshToken();
        const newToken = res.accessToken;
        if (newToken) {
          localStorage.setItem("token", newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          onRefreshed(newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(new Error("Session expired. Please login again."));
      } finally {
        isRefreshing = false;
      }
    }
    if (error.response && error.response.status === 403) {
      return Promise.reject(new Error("Permission denied"));
    }
    return Promise.reject(error);
  }
);


export const authApi = {
  login: (payload: LoginPayload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  register: (payload: any) => api.post("/auth/register", payload),
  refreshToken: () => api.post("/auth/refresh"),
};

export const settingsApi = {
  // Basic Settings (Super Admin)
  getBasicSettings: () => api.get('/admin/settings/basic/typed'),
  updateBasicSettings: (data: UpdateBasicSettingsDto) => api.put('/admin/settings/basic/typed', data),

  // Application Settings
  getApplicationSettings: () => api.get('/admin/settings/application/typed'),
  updateApplicationSettings: (data: UpdateApplicationSettingsDto) =>
    api.put('/admin/settings/application/typed', data),

  // System Settings
  getSystemSettings: () => api.get('/admin/settings/system/typed'),
  updateSystemSettings: (data: UpdateSystemSettingsDto) =>
    api.put('/admin/settings/system/typed', data),

  // Branding Settings
  getBrandingSettings: () => api.get('/admin/settings/branding/typed'),
  updateBrandingSettings: (data: UpdateBrandingSettingsDto) =>
    api.put('/admin/settings/branding/typed', data),

  // Pages Settings
  getPagesSettings: () => api.get('/admin/settings/pages/typed'),
  updatePagesSettings: (data: UpdatePagesSettingsDto) =>
    api.put('/admin/settings/pages/typed', data),

  // Currency Settings
  getCurrencySettings: () => api.get('/admin/settings/currency/typed'),
  updateCurrencySettings: (data: UpdateCurrencySettingsDto) =>
    api.put('/admin/settings/currency/typed', data),

  // SEO Settings
  getSeoSettings: () => api.get('/admin/settings/seo/typed'),
  updateSeoSettings: (data: UpdateSeoSettingsDto) =>
    api.put('/admin/settings/seo/typed', data),

  // Email / SMTP Settings
  getEmailSettings: () => api.get('/admin/settings/email/typed'),
  updateEmailSettings: (data: UpdateEmailSettingsDto) =>
    api.put('/admin/settings/email/typed', data),

  sendTestEmail: (payload: { testRecipient: string }) =>
    api.post('/admin/settings/email/test', payload),

  // Referral Settings
  getReferralSettings: () => api.get('/admin/settings/referral/typed'),
  updateReferralSettings: (data: UpdateReferralSettingsDto) =>
    api.put('/admin/settings/referral/typed', data),

  // Reports Settings
  getReportsSettings: () => api.get('/admin/settings/reports/typed'),
  updateReportsSettings: (data: UpdateReportsSettingsDto) =>
    api.put('/admin/settings/reports/typed', data),

  // Notification Settings
  getNotificationSettings: () => api.get('/admin/settings/notifications/typed'),
  updateNotificationSettings: (data: UpdateNotificationSettingsDto) =>
    api.put('/admin/settings/notifications/typed', data),

  // UI Color Settings (Light)
  getUiColorsLightSettings: () => api.get('/admin/settings/ui/colors/light/typed'),
  updateUiColorsLightSettings: (data: UiColorsLightSettingsDto) =>
    api.put('/admin/settings/ui/colors/light/typed', data),

  // UI Color Settings (Dark)
  getUiColorsDarkSettings: () => api.get('/admin/settings/ui/colors/dark/typed'),
  updateUiColorsDarkSettings: (data: UiColorsDarkSettingsDto) =>
    api.put('/admin/settings/ui/colors/dark/typed', data),

  // UI Color Settings (Categories)
  getUiColorsCategoriesSettings: () =>
    api.get('/admin/settings/ui/colors/categories/typed'),
  updateUiColorsCategoriesSettings: (data: UiColorsCategoriesSettingsDto) =>
    api.put('/admin/settings/ui/colors/categories/typed', data),

  // UI Toggle Settings
  getUiTogglesSettings: () => api.get('/admin/settings/ui/toggles/typed'),
  updateUiTogglesSettings: (data: UiTogglesSettingsDto) =>
    api.put('/admin/settings/ui/toggles/typed', data),

  // UI Typography Settings
  getUiTypographySettings: () => api.get('/admin/settings/ui/typography/typed'),
  updateUiTypographySettings: (data: UiTypographySettingsDto) =>
    api.put('/admin/settings/ui/typography/typed', data),

  // Payment Settings
  getPaymentSettings: () => api.get('/admin/settings/payment/typed'),
  updatePaymentSettings: (data: UpdatePaymentSettingsDto) =>
    api.put('/admin/settings/payment/typed', data),

  // Integration Settings (Slack, Telegram, Twilio)
  getIntegrationSettings: () => api.get('/admin/settings/integrations/typed'),
  updateIntegrationSettings: (data: UpdateIntegrationSettingsDto) =>
    api.put('/admin/settings/integrations/typed', data),

  // IP Restriction Settings
  getIpRestrictionSettings: () =>
    api.get('/admin/settings/ip-restriction/typed'),
  updateIpRestrictionSettings: (data: UpdateIpRestrictionSettingsDto) =>
    api.put('/admin/settings/ip-restriction/typed', data),
};

export const notificationsApi = {
  getMyNotifications: () => api.get<UserNotificationDto[]>('/notifications/my'),
  markAllRead: () => api.post<{ updated: number }>('/notifications/mark-all-read', {}),
};

export const chatApi = {
  listRooms: () => api.get<ChatRoomDto[]>('/chat/rooms'),
  createRoom: (payload: { name: string; description?: string; isPrivate?: boolean }) =>
    api.post<ChatRoomDto>('/chat/rooms', payload),
  listMessages: (roomId: string, params?: { before?: string; limit?: number }) =>
    api.get<ChatMessageDto[]>(`/chat/rooms/${roomId}/messages`, { params }),
  postMessage: (roomId: string, content: string) =>
    api.post<ChatMessageDto>(`/chat/rooms/${roomId}/messages`, { content }),
  listMembers: (roomId: string) =>
    api.get<ChatRoomMemberDto[]>(`/chat/rooms/${roomId}/members`),
  joinRoom: (roomId: string) =>
    api.post<ChatRoomMemberDto>(`/chat/rooms/${roomId}/join`, {}),
  archiveRoom: (roomId: string, archived: boolean) =>
    api.patch<ChatRoomDto>(`/chat/admin/rooms/${roomId}/archive`, { archived }),
  removeMember: (roomId: string, userId: string) =>
    api.delete<{ success: boolean }>(`/chat/admin/rooms/${roomId}/members/${userId}`),
};

// Public (non-admin) accessors for read-only settings used by tenant dashboards
export const publicSettingsApi = {
  getReportsDefaults: () => api.get<ReportsSettingsDto>('/settings/reports'),
};

// Developer Portal API (API keys + webhook logs)
export const developerApi = {
  createApiKey: (payload: CreateApiKeyRequestDto) =>
    api.post<ApiKeyCreatedResponseDto>('/developer/api-keys', payload),
  listApiKeys: () => api.get<ApiKeySummaryDto[]>('/developer/api-keys'),
  revokeApiKey: (keyId: string) =>
    api.post<{ success: boolean }>(`/developer/api-keys/${keyId}/revoke`, {}),
  deleteApiKey: (keyId: string) =>
    api.delete<{ success: boolean }>(`/developer/api-keys/${keyId}`),
  listWebhookLogs: (params?: { limit?: number; skip?: number; event?: string; status?: string }) =>
    api.get<WebhookLogListResponseDto>('/developer/webhook-logs', { params }),
  getWebhookLog: (logId: string) =>
    api.get<WebhookLogDetailDto>(`/developer/webhook-logs/${logId}`),
};

// Marketplace API (tenant plugin catalog and installs)
export const marketplaceApi = {
  listPlugins: () => api.get<MarketplacePluginDto[]>('/marketplace/plugins'),
  listInstalls: () => api.get<TenantPluginInstallDto[]>('/marketplace/installs'),
  installPlugin: (payload: { pluginId: string; config?: Record<string, unknown> }) =>
    api.post<TenantPluginInstallDto>('/marketplace/install', payload),
  togglePlugin: (pluginId: string, enabled: boolean) =>
    api.post<{ id: string; pluginId: string; enabled: boolean }>('/marketplace/toggle', {
      pluginId,
      enabled,
    }),
  uninstallPlugin: (pluginId: string) =>
    api.delete<{ success: boolean }>(`/marketplace/installs/${pluginId}`),
};

// AI Services API (completion, sentiment, suggestions)
export const aiApi = {
  generateCompletion: (payload: AiCompletionRequestDto) =>
    api.post<AiCompletionResponseDto>('/ai/complete', payload),
  analyzeSentiment: (text: string) =>
    api.post<SentimentAnalysisResponseDto>('/ai/sentiment', { text }),
  generateSuggestions: (topic: string, contentType: string) =>
    api.post<string[]>('/ai/suggest', { topic, contentType }),
};

// Tenant Domains API (health summary + management helpers)
export const tenantDomainsApi = {
  getHealthSummary: () =>
    api.get<TenantDomainHealthSummaryDto>('/domains/tenant/health-summary'),
  listForTenant: () =>
    api.get<TenantCustomDomainDto[]>('/domains/tenant/list'),
  verifyDns: (domainId: string) =>
    api.post<{ success: boolean }>(`/domains/tenant/${domainId}/verify-dns`, {}),
  issueSsl: (domainId: string, provider?: string) =>
    api.post<{ success: boolean }>(`/domains/tenant/${domainId}/issue-ssl`, provider ? { provider } : {}),
};

export const dashboardsApi = api;

export default api;

// (Removed duplicate export type block)
// All duplicate declarations and exports have been removed from this file.