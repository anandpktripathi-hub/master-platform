import React, { useEffect, useMemo, useState } from 'react';
import {
  ApplicationSettingsDto,
  BasicSettingsDto,
  SystemSettingsDto,
  settingsApi,
  UpdateApplicationSettingsDto,
  UpdateBasicSettingsDto,
  UpdateSystemSettingsDto,
} from '../lib/api';

type TabKey = 'basic' | 'application' | 'system';

const emptyBasic: BasicSettingsDto = {
  siteTitle: '',
  siteTagLine: '',
  footerCopyright: '',
  siteLogo: '',
  siteWhiteLogo: '',
  siteFavicon: '',
};

const emptyApplication: ApplicationSettingsDto = {
  appName: '',
  appTimezone: 'UTC',
  isLiveServer: false,
  appDebug: false,
  subscriptionExpiryWarningDays: 3,
};

const emptySystem: SystemSettingsDto = {
  defaultLanguage: 'en',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  calendarStartDay: 'monday',
  defaultTimezone: 'UTC',
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  const [basic, setBasic] = useState<BasicSettingsDto>(emptyBasic);
  const [application, setApplication] = useState<ApplicationSettingsDto>(emptyApplication);
  const [system, setSystem] = useState<SystemSettingsDto>(emptySystem);

  const [loading, setLoading] = useState({ basic: false, application: false, system: false });
  const [saving, setSaving] = useState({ basic: false, application: false, system: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const tabs = useMemo(
    () => [
      { key: 'basic' as TabKey, label: 'Basic Settings' },
      { key: 'application' as TabKey, label: 'Application Settings' },
      { key: 'system' as TabKey, label: 'System Settings' },
    ],
    [],
  );

  const loadAll = async () => {
    setError(null);
    await Promise.all([loadBasic(), loadApplication(), loadSystem()]);
  };

  const loadBasic = async () => {
    setLoading((prev) => ({ ...prev, basic: true }));
    try {
      const res = await settingsApi.getBasicSettings();
      setBasic(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load basic settings');
    } finally {
      setLoading((prev) => ({ ...prev, basic: false }));
    }
  };

  const loadApplication = async () => {
    setLoading((prev) => ({ ...prev, application: true }));
    try {
      const res = await settingsApi.getApplicationSettings();
      setApplication(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load application settings');
    } finally {
      setLoading((prev) => ({ ...prev, application: false }));
    }
  };

  const loadSystem = async () => {
    setLoading((prev) => ({ ...prev, system: true }));
    try {
      const res = await settingsApi.getSystemSettings();
      setSystem(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load system settings');
    } finally {
      setLoading((prev) => ({ ...prev, system: false }));
    }
  };

  const saveBasic = async () => {
    setSaving((prev) => ({ ...prev, basic: true }));
    setError(null);
    setSuccess(null);
    try {
      const res = await settingsApi.updateBasicSettings(basic as UpdateBasicSettingsDto);
      setBasic(res);
      setSuccess('Basic settings updated');
    } catch (err: any) {
      setError(err?.message || 'Failed to save basic settings');
    } finally {
      setSaving((prev) => ({ ...prev, basic: false }));
    }
  };

  const saveApplication = async () => {
    setSaving((prev) => ({ ...prev, application: true }));
    setError(null);
    setSuccess(null);
    try {
      const res = await settingsApi.updateApplicationSettings(
        application as UpdateApplicationSettingsDto,
      );
      setApplication(res);
      setSuccess('Application settings updated');
    } catch (err: any) {
      setError(err?.message || 'Failed to save application settings');
    } finally {
      setSaving((prev) => ({ ...prev, application: false }));
    }
  };

  const saveSystem = async () => {
    setSaving((prev) => ({ ...prev, system: true }));
    setError(null);
    setSuccess(null);
    try {
      const res = await settingsApi.updateSystemSettings(system as UpdateSystemSettingsDto);
      setSystem(res);
      setSuccess('System settings updated');
    } catch (err: any) {
      setError(err?.message || 'Failed to save system settings');
    } finally {
      setSaving((prev) => ({ ...prev, system: false }));
    }
  };

  const renderTab = () => {
    if (activeTab === 'basic') {
      return (
        <SettingsCard
          title="Basic Settings"
          loading={loading.basic}
          saving={saving.basic}
          onSave={saveBasic}
        >
          <FormGrid>
            <TextField
              label="Site Title"
              value={basic.siteTitle}
              onChange={(v) => setBasic({ ...basic, siteTitle: v })}
            />
            <TextField
              label="Site Tagline"
              value={basic.siteTagLine}
              onChange={(v) => setBasic({ ...basic, siteTagLine: v })}
            />
            <TextField
              label="Footer Copyright"
              value={basic.footerCopyright}
              onChange={(v) => setBasic({ ...basic, footerCopyright: v })}
            />
            <TextField
              label="Site Logo URL"
              value={basic.siteLogo}
              onChange={(v) => setBasic({ ...basic, siteLogo: v })}
            />
            <TextField
              label="White Logo URL"
              value={basic.siteWhiteLogo}
              onChange={(v) => setBasic({ ...basic, siteWhiteLogo: v })}
            />
            <TextField
              label="Favicon URL"
              value={basic.siteFavicon}
              onChange={(v) => setBasic({ ...basic, siteFavicon: v })}
            />
          </FormGrid>
        </SettingsCard>
      );
    }

    if (activeTab === 'application') {
      return (
        <SettingsCard
          title="Application Settings"
          loading={loading.application}
          saving={saving.application}
          onSave={saveApplication}
        >
          <FormGrid>
            <TextField
              label="App Name"
              value={application.appName}
              onChange={(v) => setApplication({ ...application, appName: v })}
            />
            <TextField
              label="App Timezone"
              value={application.appTimezone}
              onChange={(v) => setApplication({ ...application, appTimezone: v })}
            />
            <CheckboxField
              label="Live Server"
              checked={application.isLiveServer}
              onChange={(v) => setApplication({ ...application, isLiveServer: v })}
            />
            <CheckboxField
              label="Debug Mode"
              checked={application.appDebug}
              onChange={(v) => setApplication({ ...application, appDebug: v })}
            />
            <TextField
              label="Subscription expiry warning days"
              value={String(application.subscriptionExpiryWarningDays ?? 3)}
              onChange={(v) =>
                setApplication({
                  ...application,
                  subscriptionExpiryWarningDays: Number(v) || 0,
                })
              }
            />
          </FormGrid>
        </SettingsCard>
      );
    }

    return (
      <SettingsCard
        title="System Settings"
        loading={loading.system}
        saving={saving.system}
        onSave={saveSystem}
      >
        <FormGrid>
          <TextField
            label="Default Language"
            value={system.defaultLanguage}
            onChange={(v) => setSystem({ ...system, defaultLanguage: v })}
          />
          <TextField
            label="Date Format"
            value={system.dateFormat}
            onChange={(v) => setSystem({ ...system, dateFormat: v })}
          />
          <TextField
            label="Time Format"
            value={system.timeFormat}
            onChange={(v) => setSystem({ ...system, timeFormat: v })}
          />
          <TextField
            label="Calendar Start Day"
            value={system.calendarStartDay}
            onChange={(v) => setSystem({ ...system, calendarStartDay: v })}
          />
          <TextField
            label="Default Timezone"
            value={system.defaultTimezone}
            onChange={(v) => setSystem({ ...system, defaultTimezone: v })}
          />
        </FormGrid>
      </SettingsCard>
    );
  };

  return (
    <ErrorBoundary>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        {saving[activeTab] && <span className="text-sm text-slate-400">Saving…</span>}
      </div>

      <div className="flex gap-2 border border-slate-800 rounded-lg p-1 bg-slate-900">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm rounded-md transition border border-transparent ${
              activeTab === tab.key
                ? 'bg-teal-600 text-white'
                : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-100 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {renderTab()}
      </div>
    </ErrorBoundary>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function TextField({ label, value, onChange }: TextFieldProps) {
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

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
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

type SettingsCardProps = {
  title: string;
  loading?: boolean;
  saving?: boolean;
  onSave: () => void;
  children: React.ReactNode;
};

function SettingsCard({ title, loading, saving, onSave, children }: SettingsCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
          {loading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <button
          onClick={onSave}
          disabled={saving || loading}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            saving || loading
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

type FormGridProps = { children: React.ReactNode };
function FormGrid({ children }: FormGridProps) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
