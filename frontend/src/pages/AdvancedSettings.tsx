import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  settingsApi,
  BrandingSettingsDto,
  UpdateBrandingSettingsDto,
  PagesSettingsDto,
  UpdatePagesSettingsDto,
  CurrencySettingsDto,
  UpdateCurrencySettingsDto,
  SeoSettingsDto,
  UpdateSeoSettingsDto,
  EmailSettingsDto,
  UpdateEmailSettingsDto,
  ReferralSettingsDto,
  UpdateReferralSettingsDto,
  ReportsSettingsDto,
  UpdateReportsSettingsDto,
  PaymentSettingsDto,
  UpdatePaymentSettingsDto,
  IpRestrictionSettingsDto,
  UpdateIpRestrictionSettingsDto,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
  IntegrationSettingsDto,
  UpdateIntegrationSettingsDto,
} from '../lib/api';

type TabKey =
  | 'branding'
  | 'pages'
  | 'currency'
  | 'seo'
  | 'email'
  | 'referral'
  | 'reports'
  | 'notifications'
  | 'integrations'
  | 'payment'
  | 'security';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'branding', label: 'Branding' },
  { key: 'pages', label: 'Pages' },
  { key: 'currency', label: 'Currency' },
  { key: 'seo', label: 'SEO' },
  { key: 'email', label: 'Email / SMTP' },
  { key: 'referral', label: 'Referral' },
  { key: 'reports', label: 'Reports' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'integrations', label: 'Integrations & Push' },
  { key: 'payment', label: 'Payments' },
  { key: 'security', label: 'Security (IP)' },
];

const emptyBranding: BrandingSettingsDto = {
  siteLogo: '',
  siteWhiteLogo: '',
  favicon: '',
  logoDark: '',
  logoLight: '',
  brandFavicon: '',
  titleText: '',
  footerText: '',
  breadcrumbImageLeft: '',
  breadcrumbImageRight: '',
  mainHeroImage: '',
};

const emptyPages: PagesSettingsDto = {
  homePageId: null,
  pricingPageId: null,
  enableLandingPage: false,
  enableSignup: false,
  enableRTL: false,
  layoutDark: false,
  sidebarTransparent: false,
  categoryWiseSidemenu: false,
};

const emptyCurrency: CurrencySettingsDto = {
  decimalFormat: '',
  defaultCurrencyCode: '',
  decimalSeparator: 'dot',
  thousandSeparator: 'dot',
  floatNumberFormat: 'dot',
  currencySymbolSpace: 'with',
  currencySymbolPosition: 'pre',
  currencySymbolMode: 'symbol',
};

const emptySeo: SeoSettingsDto = {
  metaTitle: '',
  metaTags: [],
  metaKeywords: [],
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalType: undefined,
};

const emptyEmail: EmailSettingsDto = {
  globalFromEmail: '',
  smtpHost: '',
  smtpUsername: '',
  smtpPassword: '',
  smtpDriver: '',
  smtpPort: 0,
  smtpEncryption: 'none',
};

const emptyReferral: ReferralSettingsDto = {
  enabled: false,
  commissionPercent: 0,
  minimumThresholdAmount: 0,
  guidelines: '',
};

const emptyReports: ReportsSettingsDto = {
  defaultStartMonthOffset: 0,
  defaultStatusFilter: [],
};

const emptyNotifications: NotificationSettingsDto = {
  events: {},
  defaultEmailTemplatePrefix: '',
};

const emptyIntegrations: IntegrationSettingsDto = {
  slack: {
    enabled: false,
    webhookUrl: '',
  },
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
  },
  twilio: {
    enabled: false,
    accountSid: '',
    authToken: '',
    fromNumber: '',
  },
};

const emptyPayment: PaymentSettingsDto = {
  enablePayments: false,
  gateways: {},
};

const emptyIpRestriction: IpRestrictionSettingsDto = {
  enabled: false,
  allowedIps: [],
};

export default function AdvancedSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'branding';
  const [active, setActive] = useState<TabKey>(initialTab);

  const [branding, setBranding] = useState<BrandingSettingsDto>(emptyBranding);
  const [pages, setPages] = useState<PagesSettingsDto>(emptyPages);
  const [currency, setCurrency] = useState<CurrencySettingsDto>(emptyCurrency);
  const [seo, setSeo] = useState<SeoSettingsDto>(emptySeo);
  const [email, setEmail] = useState<EmailSettingsDto>(emptyEmail);
  const [referral, setReferral] = useState<ReferralSettingsDto>(emptyReferral);
  const [reports, setReports] = useState<ReportsSettingsDto>(emptyReports);
  const [notifications, setNotifications] = useState<NotificationSettingsDto>(emptyNotifications);
  const [integrations, setIntegrations] = useState<IntegrationSettingsDto>(emptyIntegrations);
  const [payment, setPayment] = useState<PaymentSettingsDto>(emptyPayment);
  const [ipRestriction, setIpRestriction] = useState<IpRestrictionSettingsDto>(emptyIpRestriction);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [saving, setSaving] = useState<Record<TabKey, boolean>>({
    branding: false,
    pages: false,
    currency: false,
    seo: false,
    email: false,
    referral: false,
    reports: false,
    notifications: false,
      integrations: false,
    payment: false,
    security: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr(null);
      setMsg(null);
      setLoading(true);
      try {
        const [b, p, c, s, e, r, rp, n, integ, pay, ip] = await Promise.all([
          settingsApi.getBrandingSettings(),
          settingsApi.getPagesSettings(),
          settingsApi.getCurrencySettings(),
          settingsApi.getSeoSettings(),
          settingsApi.getEmailSettings(),
          settingsApi.getReferralSettings(),
          settingsApi.getReportsSettings(),
          settingsApi.getNotificationSettings(),
          settingsApi.getIntegrationSettings(),
          settingsApi.getPaymentSettings(),
          settingsApi.getIpRestrictionSettings(),
        ]);
        if (!mounted) return;
        setBranding(b);
        setPages(p);
        setCurrency(c);
        setSeo(s);
        setEmail(e);
        setReferral(r);
        setReports(rp);
        setNotifications(n);
        setIntegrations(integ);
        setPayment(pay);
        setIpRestriction(ip);
      } catch (error: any) {
        if (!mounted) return;
        setErr(error?.message || 'Failed to load settings');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setSavingFor = (key: TabKey, val: boolean) => setSaving((prev) => ({ ...prev, [key]: val }));

  const handleSave = async (key: TabKey) => {
    setMsg(null);
    setErr(null);
    setSavingFor(key, true);
    try {
      switch (key) {
        case 'branding': {
          const res = await settingsApi.updateBrandingSettings(branding as UpdateBrandingSettingsDto);
          setBranding(res);
          break;
        }
        case 'pages': {
          const res = await settingsApi.updatePagesSettings(pages as UpdatePagesSettingsDto);
          setPages(res);
          break;
        }
        case 'currency': {
          const res = await settingsApi.updateCurrencySettings(currency as UpdateCurrencySettingsDto);
          setCurrency(res);
          break;
        }
        case 'seo': {
          const res = await settingsApi.updateSeoSettings(seo as UpdateSeoSettingsDto);
          setSeo(res);
          break;
        }
        case 'email': {
          const res = await settingsApi.updateEmailSettings(email as UpdateEmailSettingsDto);
          setEmail(res);
          break;
        }
        case 'referral': {
          const res = await settingsApi.updateReferralSettings(referral as UpdateReferralSettingsDto);
          setReferral(res);
          break;
        }
        case 'reports': {
          const res = await settingsApi.updateReportsSettings(reports as UpdateReportsSettingsDto);
          setReports(res);
          break;
        }
        case 'notifications': {
          const res = await settingsApi.updateNotificationSettings(
            notifications as UpdateNotificationSettingsDto,
          );
          setNotifications(res);
          break;
        }
        case 'integrations': {
          const res = await settingsApi.updateIntegrationSettings(
            integrations as UpdateIntegrationSettingsDto,
          );
          setIntegrations(res);
          break;
        }
        case 'payment': {
          const res = await settingsApi.updatePaymentSettings(payment as UpdatePaymentSettingsDto);
          setPayment(res);
          break;
        }
        case 'security': {
          const res = await settingsApi.updateIpRestrictionSettings(
            ipRestriction as UpdateIpRestrictionSettingsDto,
          );
          setIpRestriction(res);
          break;
        }
      }
      setMsg('Saved successfully.');
    } catch (error: any) {
      setErr(error?.message || 'Failed to save');
    } finally {
      setSavingFor(key, false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient) {
      setErr('Please enter a recipient email address');
      return;
    }
    setSendingTest(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await settingsApi.sendTestEmail({ testRecipient });
      setMsg(res.message);
    } catch (error: any) {
      setErr(error?.response?.data?.message || error?.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const isSaving = saving[active];

  const tabContent = useMemo(() => {
    if (loading) return <div className="text-slate-400">Loading…</div>;

    switch (active) {
      case 'branding':
        return (
          <SectionCard title="Branding" onSave={() => handleSave('branding')} saving={isSaving}>
            <FormGrid>
              <TextField label="Site Logo" value={branding.siteLogo} onChange={(v) => setBranding({ ...branding, siteLogo: v })} />
              <TextField label="Site White Logo" value={branding.siteWhiteLogo} onChange={(v) => setBranding({ ...branding, siteWhiteLogo: v })} />
              <TextField label="Favicon" value={branding.favicon} onChange={(v) => setBranding({ ...branding, favicon: v })} />
              <TextField label="Logo Dark" value={branding.logoDark} onChange={(v) => setBranding({ ...branding, logoDark: v })} />
              <TextField label="Logo Light" value={branding.logoLight} onChange={(v) => setBranding({ ...branding, logoLight: v })} />
              <TextField label="Brand Favicon" value={branding.brandFavicon} onChange={(v) => setBranding({ ...branding, brandFavicon: v })} />
              <TextField label="Title Text" value={branding.titleText} onChange={(v) => setBranding({ ...branding, titleText: v })} />
              <TextField label="Footer Text" value={branding.footerText} onChange={(v) => setBranding({ ...branding, footerText: v })} />
              <TextField label="Breadcrumb Image Left" value={branding.breadcrumbImageLeft} onChange={(v) => setBranding({ ...branding, breadcrumbImageLeft: v })} />
              <TextField label="Breadcrumb Image Right" value={branding.breadcrumbImageRight} onChange={(v) => setBranding({ ...branding, breadcrumbImageRight: v })} />
              <TextField label="Main Hero Image" value={branding.mainHeroImage} onChange={(v) => setBranding({ ...branding, mainHeroImage: v })} />
            </FormGrid>
          </SectionCard>
        );
      case 'pages':
        return (
          <SectionCard title="Pages" onSave={() => handleSave('pages')} saving={isSaving}>
            <FormGrid>
              <TextField label="Home Page ID" value={pages.homePageId ?? ''} onChange={(v) => setPages({ ...pages, homePageId: v || null })} />
              <TextField label="Pricing Page ID" value={pages.pricingPageId ?? ''} onChange={(v) => setPages({ ...pages, pricingPageId: v || null })} />
              <CheckboxField label="Enable Landing Page" checked={pages.enableLandingPage} onChange={(v) => setPages({ ...pages, enableLandingPage: v })} />
              <CheckboxField label="Enable Signup" checked={pages.enableSignup} onChange={(v) => setPages({ ...pages, enableSignup: v })} />
              <CheckboxField label="Enable RTL" checked={pages.enableRTL} onChange={(v) => setPages({ ...pages, enableRTL: v })} />
              <CheckboxField label="Dark Layout" checked={pages.layoutDark} onChange={(v) => setPages({ ...pages, layoutDark: v })} />
              <CheckboxField label="Sidebar Transparent" checked={pages.sidebarTransparent} onChange={(v) => setPages({ ...pages, sidebarTransparent: v })} />
              <CheckboxField label="Category-wise Sidemenu" checked={pages.categoryWiseSidemenu} onChange={(v) => setPages({ ...pages, categoryWiseSidemenu: v })} />
            </FormGrid>
          </SectionCard>
        );
      case 'currency':
        return (
          <SectionCard title="Currency" onSave={() => handleSave('currency')} saving={isSaving}>
            <FormGrid>
              <TextField label="Decimal Format" value={currency.decimalFormat} onChange={(v) => setCurrency({ ...currency, decimalFormat: v })} />
              <TextField label="Default Currency Code" value={currency.defaultCurrencyCode} onChange={(v) => setCurrency({ ...currency, defaultCurrencyCode: v })} />
              <SelectField
                label="Decimal Separator"
                value={currency.decimalSeparator}
                onChange={(v) => setCurrency({ ...currency, decimalSeparator: v as CurrencySettingsDto['decimalSeparator'] })}
                options={['dot', 'comma']}
              />
              <SelectField
                label="Thousand Separator"
                value={currency.thousandSeparator}
                onChange={(v) => setCurrency({ ...currency, thousandSeparator: v as CurrencySettingsDto['thousandSeparator'] })}
                options={['dot', 'comma', 'space', 'none']}
              />
              <SelectField
                label="Float Number Format"
                value={currency.floatNumberFormat}
                onChange={(v) => setCurrency({ ...currency, floatNumberFormat: v as CurrencySettingsDto['floatNumberFormat'] })}
                options={['dot', 'comma']}
              />
              <SelectField
                label="Currency Symbol Space"
                value={currency.currencySymbolSpace}
                onChange={(v) => setCurrency({ ...currency, currencySymbolSpace: v as CurrencySettingsDto['currencySymbolSpace'] })}
                options={['with', 'without']}
              />
              <SelectField
                label="Currency Symbol Position"
                value={currency.currencySymbolPosition}
                onChange={(v) => setCurrency({ ...currency, currencySymbolPosition: v as CurrencySettingsDto['currencySymbolPosition'] })}
                options={['pre', 'post']}
              />
              <SelectField
                label="Currency Symbol Mode"
                value={currency.currencySymbolMode}
                onChange={(v) => setCurrency({ ...currency, currencySymbolMode: v as CurrencySettingsDto['currencySymbolMode'] })}
                options={['symbol', 'name']}
              />
            </FormGrid>
          </SectionCard>
        );
      case 'seo':
        return (
          <SectionCard title="SEO" onSave={() => handleSave('seo')} saving={isSaving}>
            <FormGrid>
              <TextField label="Meta Title" value={seo.metaTitle} onChange={(v) => setSeo({ ...seo, metaTitle: v })} />
              <TextAreaField label="Meta Description" value={seo.metaDescription} onChange={(v) => setSeo({ ...seo, metaDescription: v })} />
              <TextField label="OG Title" value={seo.ogTitle} onChange={(v) => setSeo({ ...seo, ogTitle: v })} />
              <TextAreaField label="OG Description" value={seo.ogDescription} onChange={(v) => setSeo({ ...seo, ogDescription: v })} />
              <TextField label="OG Image" value={seo.ogImage} onChange={(v) => setSeo({ ...seo, ogImage: v })} />
              <TextField label="Canonical Type" value={seo.canonicalType ?? ''} onChange={(v) => setSeo({ ...seo, canonicalType: v || undefined })} />
              <TextField
                label="Meta Tags (comma-separated)"
                value={seo.metaTags.join(', ')}
                onChange={(v) => setSeo({ ...seo, metaTags: splitComma(v) })}
              />
              <TextField
                label="Meta Keywords (comma-separated)"
                value={seo.metaKeywords.join(', ')}
                onChange={(v) => setSeo({ ...seo, metaKeywords: splitComma(v) })}
              />
            </FormGrid>
          </SectionCard>
        );
      case 'email':
        return (
          <SectionCard title="Email / SMTP" onSave={() => handleSave('email')} saving={isSaving}>
            <FormGrid>
              <TextField label="Global From Email" value={email.globalFromEmail} onChange={(v) => setEmail({ ...email, globalFromEmail: v })} />
              <TextField label="SMTP Host" value={email.smtpHost} onChange={(v) => setEmail({ ...email, smtpHost: v })} />
              <TextField label="SMTP Username" value={email.smtpUsername} onChange={(v) => setEmail({ ...email, smtpUsername: v })} />
              <TextField label="SMTP Password" value={email.smtpPassword} onChange={(v) => setEmail({ ...email, smtpPassword: v })} />
              <TextField label="SMTP Driver" value={email.smtpDriver} onChange={(v) => setEmail({ ...email, smtpDriver: v })} />
              <NumberField label="SMTP Port" value={email.smtpPort} onChange={(v) => setEmail({ ...email, smtpPort: v })} />
              <SelectField
                label="SMTP Encryption"
                value={email.smtpEncryption}
                onChange={(v) => setEmail({ ...email, smtpEncryption: v as EmailSettingsDto['smtpEncryption'] })}
                options={['ssl', 'tls', 'none']}
              />
            </FormGrid>
            
            {/* Test Email Section */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-lg font-medium mb-4">Test Email</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Recipient Email</label>
                  <input
                    type="email"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={email.globalFromEmail || 'admin@example.com'}
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTest || !testRecipient}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingTest ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          </SectionCard>
        );
      case 'referral':
        return (
          <SectionCard title="Referral" onSave={() => handleSave('referral')} saving={isSaving}>
            <FormGrid>
              <CheckboxField label="Enabled" checked={referral.enabled} onChange={(v) => setReferral({ ...referral, enabled: v })} />
              <NumberField label="Commission Percent" value={referral.commissionPercent} onChange={(v) => setReferral({ ...referral, commissionPercent: v })} />
              <NumberField label="Minimum Threshold Amount" value={referral.minimumThresholdAmount} onChange={(v) => setReferral({ ...referral, minimumThresholdAmount: v })} />
              <TextAreaField label="Guidelines" value={referral.guidelines} onChange={(v) => setReferral({ ...referral, guidelines: v })} />
            </FormGrid>
          </SectionCard>
        );
      case 'reports':
        return (
          <SectionCard title="Reports" onSave={() => handleSave('reports')} saving={isSaving}>
            <FormGrid>
              <NumberField label="Default Start Month Offset" value={reports.defaultStartMonthOffset} onChange={(v) => setReports({ ...reports, defaultStartMonthOffset: v })} />
              <TextField
                label="Default Status Filter (comma-separated)"
                value={reports.defaultStatusFilter.join(', ')}
                onChange={(v) => setReports({ ...reports, defaultStatusFilter: splitComma(v) })}
              />
            </FormGrid>
          </SectionCard>
        );
      case 'notifications': {
        const entries = Object.entries(notifications.events || {});
        const crmFriendlyLabels: Record<string, string> = {
          'crm.deal.created': 'CRM · Deal created / assigned',
          'crm.deal.stage_changed': 'CRM · Deal stage changed',
          'crm.task.assigned': 'CRM · Task assigned',
          'crm.task.completed': 'CRM · Task completed',
          'billing.invoice.created': 'Billing · Invoice created',
          'billing.payment.succeeded': 'Billing · Payment succeeded',
          'billing.payment.failed': 'Billing · Payment failed (critical)',
          'billing.package.reactivated_offline': 'Billing · Subscription reactivated (offline payment)',
          'billing.subscription.expiring_soon': 'Billing · Subscription expiring soon (critical)',
          'billing.subscription.terminated': 'Billing · Subscription expired (critical)',
          'billing.ssl.expiring_soon': 'Domains · SSL certificate expiring soon (critical)',
        };

        const sorted = entries.sort(([a], [b]) => a.localeCompare(b));

        return (
          <SectionCard
            title="Notifications"
            onSave={() => handleSave('notifications')}
            saving={isSaving}
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Choose how you want to be notified per event. Email is best for detailed receipts
                and reports, in-app keeps a history in the Notification Center, and SMS is reserved
                for urgent alerts (for example failed payments, expiring subscriptions or SSL).
                To use SMS, make sure Twilio is configured under "Integrations &amp; Push" and that
                your tenant profile includes a billing phone number.
              </p>
              <FormGrid>
                <TextField
                  label="Default Email Template Prefix (optional)"
                  value={notifications.defaultEmailTemplatePrefix || ''}
                  onChange={(v) =>
                    setNotifications({
                      ...notifications,
                      defaultEmailTemplatePrefix: v || undefined,
                    })
                  }
                />
              </FormGrid>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-300">
                      <th className="text-left py-2 pr-4">Event</th>
                      <th className="text-center px-2">Email</th>
                      <th className="text-center px-2">In-app</th>
                      <th className="text-center px-2">SMS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(([eventKey, cfg]) => (
                      <tr key={eventKey} className="border-b border-slate-800 last:border-b-0">
                        <td className="py-2 pr-4">
                          <div className="font-medium text-slate-100">
                            {crmFriendlyLabels[eventKey] || eventKey}
                          </div>
                          <div className="text-xs text-slate-500">{eventKey}</div>
                        </td>
                        <td className="text-center px-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-teal-500"
                            checked={!!cfg.email}
                            onChange={(e) => {
                              setNotifications({
                                ...notifications,
                                events: {
                                  ...notifications.events,
                                  [eventKey]: {
                                    ...cfg,
                                    email: e.target.checked,
                                  },
                                },
                              });
                            }}
                          />
                        </td>
                        <td className="text-center px-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-teal-500"
                            checked={!!cfg.inApp}
                            onChange={(e) => {
                              setNotifications({
                                ...notifications,
                                events: {
                                  ...notifications.events,
                                  [eventKey]: {
                                    ...cfg,
                                    inApp: e.target.checked,
                                  },
                                },
                              });
                            }}
                          />
                        </td>
                        <td className="text-center px-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-teal-500"
                            checked={!!cfg.sms}
                            onChange={(e) => {
                              setNotifications({
                                ...notifications,
                                events: {
                                  ...notifications.events,
                                  [eventKey]: {
                                    ...cfg,
                                    sms: e.target.checked,
                                  },
                                },
                              });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        );
      }
      case 'integrations': {
        return (
          <SectionCard
            title="Integrations & Push"
            onSave={() => handleSave('integrations')}
            saving={isSaving}
          >
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2 text-slate-100">Slack</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Configure an incoming webhook for Slack to receive alerts about CRM activity,
                  billing events and other system notifications in your workspace channels.
                </p>
                <FormGrid>
                  <CheckboxField
                    label="Enable Slack integration"
                    checked={integrations.slack.enabled}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        slack: { ...integrations.slack, enabled: v },
                      })
                    }
                  />
                  <TextField
                    label="Slack Webhook URL"
                    value={integrations.slack.webhookUrl}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        slack: { ...integrations.slack, webhookUrl: v },
                      })
                    }
                  />
                </FormGrid>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-lg font-medium mb-2 text-slate-100">Telegram</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Connect a Telegram bot and channel or chat ID to receive push-style alerts
                  for important events. This is ideal for on-call or mobile-first workflows.
                </p>
                <FormGrid>
                  <CheckboxField
                    label="Enable Telegram integration"
                    checked={integrations.telegram.enabled}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        telegram: { ...integrations.telegram, enabled: v },
                      })
                    }
                  />
                  <TextField
                    label="Bot Token"
                    value={integrations.telegram.botToken}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        telegram: { ...integrations.telegram, botToken: v },
                      })
                    }
                  />
                  <TextField
                    label="Chat ID or Channel Username"
                    value={integrations.telegram.chatId}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        telegram: { ...integrations.telegram, chatId: v },
                      })
                    }
                  />
                </FormGrid>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-lg font-medium mb-2 text-slate-100">Twilio (SMS / WhatsApp)</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Configure Twilio credentials to send SMS or WhatsApp alerts for high-priority
                  events such as failed payments, expiring subscriptions or SSL certificates.
                  SMS delivery uses your tenant billing phone (company phone or public contact
                  phone). Make sure those fields are set correctly in your business profile.
                </p>
                <FormGrid>
                  <CheckboxField
                    label="Enable Twilio integration"
                    checked={integrations.twilio.enabled}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        twilio: { ...integrations.twilio, enabled: v },
                      })
                    }
                  />
                  <TextField
                    label="Account SID"
                    value={integrations.twilio.accountSid}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        twilio: { ...integrations.twilio, accountSid: v },
                      })
                    }
                  />
                  <TextField
                    label="Auth Token"
                    value={integrations.twilio.authToken}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        twilio: { ...integrations.twilio, authToken: v },
                      })
                    }
                  />
                  <TextField
                    label="From Number"
                    value={integrations.twilio.fromNumber}
                    onChange={(v) =>
                      setIntegrations({
                        ...integrations,
                        twilio: { ...integrations.twilio, fromNumber: v },
                      })
                    }
                  />
                </FormGrid>
              </div>
            </div>
          </SectionCard>
        );
      }
      case 'payment': {
        const gatewayKeys = ['stripe', 'paypal', 'paystack', 'razorpay', 'bank_transfer'] as const;
        const modulesWithoutGateway = GATEWAY_MODULES.filter((mod) =>
          !gatewayKeys.some((key) => {
            const cfg = (payment.gateways as any)[key] || {};
            if (!cfg.enabled) return false;
            const modules = cfg.modules || {};
            return modules[mod.key] !== false;
          }),
        );

        return (
          <SectionCard title="Payments" onSave={() => handleSave('payment')} saving={isSaving}>
            <FormGrid>
              <CheckboxField
                label="Enable Payments"
                checked={payment.enablePayments}
                onChange={(v) => setPayment({ ...payment, enablePayments: v })}
              />
            </FormGrid>
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-medium text-slate-100">Gateways</h3>
              <p className="text-sm text-slate-400">
                Configure credentials for Stripe, PayPal, Paystack, Razorpay and Bank Transfer.
                Stripe is fully integrated; PayPal currently validates configuration and simulates
                a successful charge so you can test flows before wiring live credentials. Additional
                gateways share the same configuration model so they can be wired to live APIs
                without changing tenant flows.
              </p>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-100 mb-2">Gateway / module matrix</h4>
                <p className="text-xs text-slate-400 mb-2">
                  Read-only snapshot of which gateways are enabled and where they are allowed.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-slate-200">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left px-2 py-1">Gateway</th>
                        <th className="text-left px-2 py-1">Enabled</th>
                        <th className="text-left px-2 py-1">Allowed modules</th>
                      </tr>
                    </thead>
                    <tbody>
                        {gatewayKeys.map((key) => {
                          const cfg = (payment.gateways as any)[key] || {};
                        const enabled = !!cfg.enabled;
                        const modules = cfg.modules || {};
                          const allowed = GATEWAY_MODULES
                          .filter((m) => modules[m.key] !== false)
                          .map((m) => m.label)
                          .join(', ');
                        const label =
                          key === 'bank_transfer'
                            ? 'Bank Transfer'
                            : key.charAt(0).toUpperCase() + key.slice(1);
                        return (
                          <tr key={key} className="border-b border-slate-800 last:border-0">
                            <td className="px-2 py-1 align-top">{label}</td>
                            <td className="px-2 py-1 align-top">
                              <span
                                className={
                                  'inline-flex px-2 py-0.5 rounded-full text-[11px] ' +
                                  (enabled
                                    ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/60'
                                    : 'bg-slate-700/40 text-slate-300 border border-slate-600')
                                }
                              >
                                {enabled ? 'On' : 'Off'}
                              </span>
                            </td>
                            <td className="px-2 py-1 align-top text-slate-300">
                              {allowed || <span className="text-slate-500">All (default)</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {modulesWithoutGateway.length > 0 ? (
                  <div className="mt-3 text-[11px] text-amber-300">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-600 mr-2">
                      ⚠ No active gateway for:
                    </span>
                    {modulesWithoutGateway.map((m) => m.label).join(', ')}
                  </div>
                ) : (
                  <div className="mt-3 text-[11px] text-emerald-300">
                    All modules have at least one enabled gateway.
                  </div>
                )}
              </div>
              <GatewayEditor
                label="Stripe"
                gatewayKey="stripe"
                config={payment.gateways['stripe']}
                onChange={(cfg) =>
                  setPayment({
                    ...payment,
                    gateways: {
                      ...payment.gateways,
                      stripe: { name: 'stripe', ...cfg },
                    },
                  })
                }
              />
              <GatewayEditor
                label="PayPal"
                gatewayKey="paypal"
                config={payment.gateways['paypal']}
                onChange={(cfg) =>
                  setPayment({
                    ...payment,
                    gateways: {
                      ...payment.gateways,
                      paypal: { name: 'paypal', ...cfg },
                    },
                  })
                }
              />
              <GatewayEditor
                label="Paystack"
                gatewayKey="paystack"
                config={payment.gateways['paystack']}
                onChange={(cfg) =>
                  setPayment({
                    ...payment,
                    gateways: {
                      ...payment.gateways,
                      paystack: { name: 'paystack', ...cfg },
                    },
                  })
                }
              />
              <GatewayEditor
                label="Razorpay"
                gatewayKey="razorpay"
                config={payment.gateways['razorpay']}
                onChange={(cfg) =>
                  setPayment({
                    ...payment,
                    gateways: {
                      ...payment.gateways,
                      razorpay: { name: 'razorpay', ...cfg },
                    },
                  })
                }
              />
              <GatewayEditor
                label="Bank Transfer"
                gatewayKey="bank_transfer"
                config={payment.gateways['bank_transfer']}
                onChange={(cfg) =>
                  setPayment({
                    ...payment,
                    gateways: {
                      ...payment.gateways,
                      bank_transfer: { name: 'bank_transfer', ...cfg },
                    },
                  })
                }
              />
            </div>
          </SectionCard>
        );
      }
      case 'security':
        return (
          <SectionCard title="Security (IP Restriction)" onSave={() => handleSave('security')} saving={isSaving}>
            <FormGrid>
              <CheckboxField
                label="Enable IP Restriction"
                checked={ipRestriction.enabled}
                onChange={(v) => setIpRestriction({ ...ipRestriction, enabled: v })}
              />
            </FormGrid>
            <div className="mt-4 space-y-2">
              <label className="block space-y-1 text-sm">
                <span className="text-slate-300">Allowed IPs (one per line)</span>
                <textarea
                  value={ipRestriction.allowedIps.join('\n')}
                  onChange={(e) =>
                    setIpRestriction({
                      ...ipRestriction,
                      allowedIps: e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  rows={4}
                  placeholder="203.0.113.5\n192.168.1.*\n*"
                />
              </label>
              <p className="text-xs text-slate-500">
                Use exact IPs (e.g. 203.0.113.5), wildcard prefixes (e.g. 192.168.1.*), or * to
                allow all. Localhost is always allowed.
              </p>
            </div>
          </SectionCard>
        );
    }
  }, [active, branding, pages, currency, seo, email, referral, reports, notifications, payment, ipRestriction, loading, isSaving]);

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Advanced Settings</h1>
        {isSaving && <span className="text-sm text-slate-400">Saving…</span>}
      </div>

      <div className="flex gap-2 border border-slate-800 rounded-lg p-1 bg-slate-900 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActive(tab.key);
              setSearchParams({ tab: tab.key });
            }}
            className={`px-3 py-2 text-sm rounded-md transition border border-transparent ${
              active === tab.key ? 'bg-teal-600 text-white' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {err && <Alert type="error" message={err} />}
      {msg && <Alert type="success" message={msg} />}

      {tabContent}
      </div>
    </ErrorBoundary>
  );
}

const GATEWAY_MODULES: { key: string; label: string }[] = [
  { key: 'packages', label: 'Packages & subscriptions' },
  { key: 'domains', label: 'Domains & custom domains' },
  { key: 'invoices', label: 'Invoices & one-off billing' },
  { key: 'pos', label: 'POS & orders' },
];

function splitComma(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
  const color = type === 'error' ? 'red' : 'emerald';
  return (
    <div className={`border px-4 py-3 rounded text-sm bg-${color}-900/30 border-${color}-700 text-${color}-100`}>
      {message}
    </div>
  );
}

function SectionCard({
  title,
  onSave,
  saving,
  children,
}: {
  title: string;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            saving ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function GatewayEditor({
  label,
  gatewayKey,
  config,
  onChange,
}: {
  label: string;
  gatewayKey: string;
  config?: {
    enabled: boolean;
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    supportedCurrencies?: string[];
    baseCurrency?: string;
    modules?: Record<string, boolean>;
  };
  onChange: (cfg: {
    enabled: boolean;
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    supportedCurrencies?: string[];
    baseCurrency?: string;
    modules?: Record<string, boolean>;
  }) => void;
}) {
  const current =
    config ||
    {
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
      supportedCurrencies: [],
      baseCurrency: '',
      modules: {},
    };
  const modules = current.modules || {};
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-100 font-semibold">{label}</h4>
        <CheckboxField
          label="Enabled"
          checked={current.enabled}
          onChange={(v) => onChange({ ...current, enabled: v })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label="Public Key / Client ID"
          value={current.publicKey || ''}
          onChange={(v) => onChange({ ...current, publicKey: v })}
        />
        <TextField
          label="Secret Key"
          value={current.secretKey || ''}
          onChange={(v) => onChange({ ...current, secretKey: v })}
        />
        <TextField
          label="Webhook Secret (optional)"
          value={current.webhookSecret || ''}
          onChange={(v) => onChange({ ...current, webhookSecret: v })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label="Supported currencies (e.g. USD,EUR,GBP)"
          value={(current.supportedCurrencies || []).join(', ')}
          onChange={(v) =>
            onChange({
              ...current,
              supportedCurrencies: splitComma(v.toUpperCase()),
            })
          }
        />
        <TextField
          label="Base currency for this gateway (e.g. USD)"
          value={current.baseCurrency || ''}
          onChange={(v) => onChange({ ...current, baseCurrency: v.toUpperCase() })}
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-slate-400">Enabled for modules</p>
        <div className="flex flex-wrap gap-3">
          {GATEWAY_MODULES.map((mod) => (
            <CheckboxField
              key={mod.key}
              label={mod.label}
              checked={modules[mod.key] !== false}
              onChange={(v) =>
                onChange({
                  ...current,
                  modules: {
                    ...modules,
                    [mod.key]: v,
                  },
                })
              }
            />
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          Disable a module here to block this gateway for that flow even if it is globally enabled.
        </p>
      </div>
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
        rows={3}
      />
    </label>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-teal-500"
      />
      <span>{label}</span>
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
