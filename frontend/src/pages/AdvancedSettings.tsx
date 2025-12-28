import React, { useEffect, useMemo, useState } from 'react';
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
} from '../lib/api';

type TabKey =
  | 'branding'
  | 'pages'
  | 'currency'
  | 'seo'
  | 'email'
  | 'referral'
  | 'reports';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'branding', label: 'Branding' },
  { key: 'pages', label: 'Pages' },
  { key: 'currency', label: 'Currency' },
  { key: 'seo', label: 'SEO' },
  { key: 'email', label: 'Email / SMTP' },
  { key: 'referral', label: 'Referral' },
  { key: 'reports', label: 'Reports' },
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

export default function AdvancedSettings() {
  const [active, setActive] = useState<TabKey>('branding');

  const [branding, setBranding] = useState<BrandingSettingsDto>(emptyBranding);
  const [pages, setPages] = useState<PagesSettingsDto>(emptyPages);
  const [currency, setCurrency] = useState<CurrencySettingsDto>(emptyCurrency);
  const [seo, setSeo] = useState<SeoSettingsDto>(emptySeo);
  const [email, setEmail] = useState<EmailSettingsDto>(emptyEmail);
  const [referral, setReferral] = useState<ReferralSettingsDto>(emptyReferral);
  const [reports, setReports] = useState<ReportsSettingsDto>(emptyReports);

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
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr(null);
      setMsg(null);
      setLoading(true);
      try {
        const [b, p, c, s, e, r, rp] = await Promise.all([
          settingsApi.getBrandingSettings(),
          settingsApi.getPagesSettings(),
          settingsApi.getCurrencySettings(),
          settingsApi.getSeoSettings(),
          settingsApi.getEmailSettings(),
          settingsApi.getReferralSettings(),
          settingsApi.getReportsSettings(),
        ]);
        if (!mounted) return;
        setBranding(b);
        setPages(p);
        setCurrency(c);
        setSeo(s);
        setEmail(e);
        setReferral(r);
        setReports(rp);
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
      default:
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
    }
  }, [active, branding, pages, currency, seo, email, referral, reports, loading, isSaving]);

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
            onClick={() => setActive(tab.key)}
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
