import React, { useEffect, useMemo, useState } from "react";
import {
  settingsApi,
  UiTogglesSettingsDto,
  UiTypographySettingsDto,
} from "../lib/api";
import type { UiColorsLightSettingsDto } from "../lib/api";
import type { UiColorsDarkSettingsDto } from "../lib/api";
import type { UiColorsCategoriesSettingsDto } from "../lib/api";

type TabKey =
  | "toggles"
  | "colorsLight"
  | "colorsDark"
  | "colorsCategories"
  | "typography";

const tabs: { key: TabKey; label: string }[] = [
  { key: "toggles", label: "Toggles" },
  { key: "colorsLight", label: "Colors – Light" },
  { key: "colorsDark", label: "Colors – Dark" },
  { key: "colorsCategories", label: "Colors – Categories" },
  { key: "typography", label: "Typography" },
];

export default function UiSettings() {
  const [active, setActive] = useState<TabKey>("toggles");

  // Toggles
  const [toggles, setToggles] = useState<UiTogglesSettingsDto | null>(null);
  const [savingToggles, setSavingToggles] = useState(false);
  const [togglesMsg, setTogglesMsg] = useState<string | null>(null);

  // Colors – Light
  const [colorsLight, setColorsLight] = useState<UiColorsLightSettingsDto | null>(null);
  const [savingColorsLight, setSavingColorsLight] = useState(false);
  const [colorsLightMsg, setColorsLightMsg] = useState<string | null>(null);

  // Colors – Dark
  const [colorsDark, setColorsDark] = useState<UiColorsDarkSettingsDto | null>(null);
  const [savingColorsDark, setSavingColorsDark] = useState(false);
  const [colorsDarkMsg, setColorsDarkMsg] = useState<string | null>(null);

  // Colors – Categories
  const [colorsCategories, setColorsCategories] = useState<UiColorsCategoriesSettingsDto | null>(null);
  const [savingColorsCategories, setSavingColorsCategories] = useState(false);
  const [colorsCategoriesMsg, setColorsCategoriesMsg] = useState<string | null>(null);

  // Typography
  const [typography, setTypography] = useState<UiTypographySettingsDto | null>(null);
  const [savingTypography, setSavingTypography] = useState(false);
  const [typographyMsg, setTypographyMsg] = useState<string | null>(null);

  const loadingAny = useMemo(
    () =>
      !toggles || !colorsLight || !colorsDark || !colorsCategories || !typography,
    [toggles, colorsLight, colorsDark, colorsCategories, typography],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [tg, cl, cd, cc, ty] = await Promise.all([
          settingsApi.getUiTogglesSettings(),
          settingsApi.getUiColorsLightSettings(),
          settingsApi.getUiColorsDarkSettings(),
          settingsApi.getUiColorsCategoriesSettings(),
          settingsApi.getUiTypographySettings(),
        ]);
        if (!mounted) return;
        setToggles(tg);
        setColorsLight(cl);
        setColorsDark(cd);
        setColorsCategories(cc);
        setTypography(ty);
      } catch (err: any) {
        console.error("Failed to load UI settings", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Appearance / UI Settings</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={
                (active === t.key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300") +
                " w-auto mr-6 whitespace-nowrap py-4 px-1 border-b-2 font-medium"
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {loadingAny ? (
        <div className="text-gray-500">Loading settings…</div>
      ) : (
        <div className="space-y-10">
          {active === "toggles" && toggles && (
            <UiTogglesSection
              value={toggles}
              onChange={setToggles}
              saving={savingToggles}
              message={togglesMsg}
              onSave={async () => {
                if (!toggles) return;
                setSavingToggles(true);
                setTogglesMsg(null);
                try {
                  const updated = await settingsApi.updateUiTogglesSettings(toggles);
                  setToggles(updated);
                  setTogglesMsg("Saved successfully.");
                } catch (e: any) {
                  setTogglesMsg(e?.message || "Failed to save toggles");
                } finally {
                  setSavingToggles(false);
                }
              }}
            />
          )}

          {active === "colorsLight" && colorsLight && (
            <UiColorsLightSection
              value={colorsLight}
              onChange={setColorsLight}
              saving={savingColorsLight}
              message={colorsLightMsg}
              onSave={async () => {
                if (!colorsLight) return;
                setSavingColorsLight(true);
                setColorsLightMsg(null);
                try {
                  const updated = await settingsApi.updateUiColorsLightSettings(colorsLight);
                  setColorsLight(updated);
                  setColorsLightMsg("Saved successfully.");
                } catch (e: any) {
                  setColorsLightMsg(e?.message || "Failed to save colors (light)");
                } finally {
                  setSavingColorsLight(false);
                }
              }}
            />
          )}

          {active === "colorsDark" && colorsDark && (
            <UiColorsDarkSection
              value={colorsDark}
              onChange={setColorsDark}
              saving={savingColorsDark}
              message={colorsDarkMsg}
              onSave={async () => {
                if (!colorsDark) return;
                setSavingColorsDark(true);
                setColorsDarkMsg(null);
                try {
                  const updated = await settingsApi.updateUiColorsDarkSettings(colorsDark);
                  setColorsDark(updated);
                  setColorsDarkMsg("Saved successfully.");
                } catch (e: any) {
                  setColorsDarkMsg(e?.message || "Failed to save colors (dark)");
                } finally {
                  setSavingColorsDark(false);
                }
              }}
            />
          )}

          {active === "colorsCategories" && colorsCategories && (
            <UiColorsCategoriesSection
              value={colorsCategories}
              onChange={setColorsCategories}
              saving={savingColorsCategories}
              message={colorsCategoriesMsg}
              onSave={async () => {
                if (!colorsCategories) return;
                setSavingColorsCategories(true);
                setColorsCategoriesMsg(null);
                try {
                  const updated = await settingsApi.updateUiColorsCategoriesSettings(colorsCategories);
                  setColorsCategories(updated);
                  setColorsCategoriesMsg("Saved successfully.");
                } catch (e: any) {
                  setColorsCategoriesMsg(e?.message || "Failed to save colors (categories)");
                } finally {
                  setSavingColorsCategories(false);
                }
              }}
            />
          )}

          {active === "typography" && typography && (
            <UiTypographySection
              value={typography}
              onChange={setTypography}
              saving={savingTypography}
              message={typographyMsg}
              onSave={async () => {
                if (!typography) return;
                setSavingTypography(true);
                setTypographyMsg(null);
                try {
                  const updated = await settingsApi.updateUiTypographySettings(typography);
                  setTypography(updated);
                  setTypographyMsg("Saved successfully.");
                } catch (e: any) {
                  setTypographyMsg(e?.message || "Failed to save typography");
                } finally {
                  setSavingTypography(false);
                }
              }}
            />
          )}
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function SaveBar({ saving, message, onSave }: { saving: boolean; message: string | null; onSave: () => void }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}

// Toggles Section
function UiTogglesSection({
  value,
  onChange,
  saving,
  message,
  onSave,
}: {
  value: UiTogglesSettingsDto;
  onChange: (next: UiTogglesSettingsDto) => void;
  saving: boolean;
  message: string | null;
  onSave: () => void;
}) {
  const toggle = (k: keyof UiTogglesSettingsDto) =>
    onChange({ ...value, [k]: !value[k] });

  const Checkbox = ({ k, label }: { k: keyof UiTogglesSettingsDto; label: string }) => (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={!!value[k]}
        onChange={() => toggle(k)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <SectionCard title="Toggles">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Checkbox k="darkModeAdmin" label="Dark Mode (Admin)" />
        <Checkbox k="stickyNavbar" label="Sticky Navbar" />
        <Checkbox k="adminNavSticky" label="Admin Nav Sticky" />
        <Checkbox k="maintenanceMode" label="Maintenance Mode" />
        <Checkbox k="mouseCursorEffect" label="Mouse Cursor Effect" />
        <Checkbox k="sectionTitleExtraDesign" label="Section Title Extra Design" />
        <Checkbox k="languageSelectorVisible" label="Language Selector Visible" />
        <Checkbox k="backendPreloaderEnabled" label="Backend Preloader Enabled" />
        <Checkbox k="paymentGatewayEnabled" label="Payment Gateway Enabled" />
        <Checkbox k="forceSSLRedirect" label="Force SSL Redirect" />
        <Checkbox k="requireEmailVerification" label="Require Email Verification" />
      </div>
      <SaveBar saving={saving} message={message} onSave={onSave} />
    </SectionCard>
  );
}

// Colors – Light Section
function UiColorsLightSection({
  value,
  onChange,
  saving,
  message,
  onSave,
}: {
  value: UiColorsLightSettingsDto;
  onChange: (next: UiColorsLightSettingsDto) => void;
  saving: boolean;
  message: string | null;
  onSave: () => void;
}) {
  const set = (k: keyof UiColorsLightSettingsDto, v: string) => onChange({ ...value, [k]: v });

  const Input = ({ k, label }: { k: keyof UiColorsLightSettingsDto; label: string }) => (
    <FieldRow label={label}>
      <input
        type="text"
        className="w-full rounded border-gray-300"
        value={value[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        placeholder="#RRGGBB or rgba()"
      />
    </FieldRow>
  );

  return (
    <SectionCard title="Colors – Light">
      <div>
        <Input k="siteMainColor1" label="Site Main Color 1" />
        <Input k="siteMainColor1Rgba" label="Site Main Color 1 (RGBA)" />
        <Input k="siteMainColor2" label="Site Main Color 2" />
        <Input k="siteMainColor3" label="Site Main Color 3" />
        <Input k="headingColor" label="Heading Color" />
        <Input k="headingColorRgb" label="Heading Color (RGB)" />
        <Input k="paragraphColor1" label="Paragraph Color 1" />
        <Input k="paragraphColor2" label="Paragraph Color 2" />
        <Input k="paragraphColor3" label="Paragraph Color 3" />
        <Input k="paragraphColor4" label="Paragraph Color 4" />
      </div>
      <SaveBar saving={saving} message={message} onSave={onSave} />
    </SectionCard>
  );
}

// Colors – Dark Section
function UiColorsDarkSection({
  value,
  onChange,
  saving,
  message,
  onSave,
}: {
  value: UiColorsDarkSettingsDto;
  onChange: (next: UiColorsDarkSettingsDto) => void;
  saving: boolean;
  message: string | null;
  onSave: () => void;
}) {
  const set = (k: keyof UiColorsDarkSettingsDto, v: string) => onChange({ ...value, [k]: v });

  const Input = ({ k, label }: { k: keyof UiColorsDarkSettingsDto; label: string }) => (
    <FieldRow label={label}>
      <input
        type="text"
        className="w-full rounded border-gray-300"
        value={value[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        placeholder="#RRGGBB or rgba()"
      />
    </FieldRow>
  );

  return (
    <SectionCard title="Colors – Dark">
      <div>
        <Input k="backgroundLightColor1" label="Background Light Color 1" />
        <Input k="backgroundLightColor2" label="Background Light Color 2" />
        <Input k="backgroundDarkColor1" label="Background Dark Color 1" />
        <Input k="backgroundDarkColor2" label="Background Dark Color 2" />
        <Input k="secondaryColor" label="Secondary Color" />
        <Input k="baseColor2" label="Base Color 2" />
        <Input k="mainColor5" label="Main Color 5" />
      </div>
      <SaveBar saving={saving} message={message} onSave={onSave} />
    </SectionCard>
  );
}

// Colors – Categories Section
function UiColorsCategoriesSection({
  value,
  onChange,
  saving,
  message,
  onSave,
}: {
  value: UiColorsCategoriesSettingsDto;
  onChange: (next: UiColorsCategoriesSettingsDto) => void;
  saving: boolean;
  message: string | null;
  onSave: () => void;
}) {
  const set = (k: keyof UiColorsCategoriesSettingsDto, v: string) => onChange({ ...value, [k]: v });

  const Input = ({ k, label }: { k: keyof UiColorsCategoriesSettingsDto; label: string }) => (
    <FieldRow label={label}>
      <input
        type="text"
        className="w-full rounded border-gray-300"
        value={value[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        placeholder="#RRGGBB or rgba()"
      />
    </FieldRow>
  );

  return (
    <SectionCard title="Colors – Categories">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input k="portfolioHomeColor" label="Portfolio Home Color" />
        <Input k="logisticsHomeColor" label="Logistics Home Color" />
        <Input k="industryHomeColor" label="Industry Home Color" />
        <Input k="constructionHomeColor" label="Construction Home Color" />
        <Input k="lawyerHomeColor" label="Lawyer Home Color" />
        <Input k="politicalHomeColor" label="Political Home Color" />
        <Input k="medicalHomeColor1" label="Medical Home Color 1" />
        <Input k="medicalHomeColor2" label="Medical Home Color 2" />
        <Input k="fruitsHomeColor" label="Fruits Home Color" />
        <Input k="fruitsHomeHeadingColor" label="Fruits Home Heading Color" />
        <Input k="portfolioHomeDarkColor1" label="Portfolio Home Dark Color 1" />
        <Input k="portfolioHomeDarkColor2" label="Portfolio Home Dark Color 2" />
        <Input k="charityHomeColor" label="Charity Home Color" />
        <Input k="designAgencyHomeColor" label="Design Agency Home Color" />
        <Input k="cleaningHomeColor" label="Cleaning Home Color" />
        <Input k="cleaningHomeColor2" label="Cleaning Home Color 2" />
        <Input k="courseHomeColor" label="Course Home Color" />
        <Input k="courseHomeColor2" label="Course Home Color 2" />
        <Input k="groceryHomeColor" label="Grocery Home Color" />
        <Input k="groceryHomeColor2" label="Grocery Home Color 2" />
      </div>
      <SaveBar saving={saving} message={message} onSave={onSave} />
    </SectionCard>
  );
}

// Typography Section
function UiTypographySection({
  value,
  onChange,
  saving,
  message,
  onSave,
}: {
  value: UiTypographySettingsDto;
  onChange: (next: UiTypographySettingsDto) => void;
  saving: boolean;
  message: string | null;
  onSave: () => void;
}) {
  const setText = (k: keyof UiTypographySettingsDto, v: string) => onChange({ ...value, [k]: v } as UiTypographySettingsDto);
  const toggle = (k: keyof UiTypographySettingsDto) => onChange({ ...value, [k]: !value[k] } as UiTypographySettingsDto);
  const setArr = (k: keyof UiTypographySettingsDto, v: string) =>
    onChange({ ...value, [k]: v.split(",").map((s) => s.trim()).filter(Boolean) } as UiTypographySettingsDto);

  return (
    <SectionCard title="Typography">
      <div>
        <FieldRow label="Use Custom Font">
          <label className="inline-flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" checked={value.useCustomFont} onChange={() => toggle("useCustomFont")} />
            <span className="text-sm">Enable custom body font</span>
          </label>
        </FieldRow>

        <FieldRow label="Body Font Family">
          <input
            type="text"
            className="w-full rounded border-gray-300"
            value={value.bodyFontFamily}
            onChange={(e) => setText("bodyFontFamily", e.target.value)}
            placeholder="e.g. Inter, Roboto"
          />
        </FieldRow>

        <FieldRow label="Body Font Variants (comma-separated)">
          <input
            type="text"
            className="w-full rounded border-gray-300"
            value={value.bodyFontVariants?.join(", ") ?? ""}
            onChange={(e) => setArr("bodyFontVariants", e.target.value)}
            placeholder="e.g. 400, 500, 700; or italic variants"
          />
        </FieldRow>

        <FieldRow label="Use Heading Font">
          <label className="inline-flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" checked={value.useHeadingFont} onChange={() => toggle("useHeadingFont")} />
            <span className="text-sm">Enable separate heading font</span>
          </label>
        </FieldRow>

        <FieldRow label="Heading Font Family">
          <input
            type="text"
            className="w-full rounded border-gray-300"
            value={value.headingFontFamily}
            onChange={(e) => setText("headingFontFamily", e.target.value)}
            placeholder="e.g. Poppins, Playfair Display"
          />
        </FieldRow>

        <FieldRow label="Heading Font Variants (comma-separated)">
          <input
            type="text"
            className="w-full rounded border-gray-300"
            value={value.headingFontVariants?.join(", ") ?? ""}
            onChange={(e) => setArr("headingFontVariants", e.target.value)}
            placeholder="e.g. 600, 700, 800; or italic variants"
          />
        </FieldRow>
      </div>
      <SaveBar saving={saving} message={message} onSave={onSave} />
    </SectionCard>
  );
}
