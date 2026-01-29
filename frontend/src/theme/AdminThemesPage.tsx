
import React, { useState } from "react";
import { useThemeContext } from "./ThemeContext";
import styles from "./AdminThemesPage.module.css";
import dynamicStyles from "./AdminThemesPagePreviewDynamic.module.css";

const defaultPreviewVars = {
  "--primary": "#22c55e",
  "--background": "#020617",
  "--surface": "#020617",
  "--text": "#e5e7eb",
  "--font-family": "Inter, sans-serif",
};

function ThemeLivePreview() {
  const { variables, updateCustomVariables } = useThemeContext();
  const [previewVars, setPreviewVars] = useState<Record<string, string>>(
    variables?.customCssVariables || defaultPreviewVars
  );

  // Dynamic style for preview area
  // Strict: inject dynamic CSS for preview area and button
  React.useEffect(() => {
    const styleId = "theme-live-preview-dynamic";
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      .${dynamicStyles.themeLivePreviewAreaDynamic} {
        background: ${previewVars["--background"]};
        color: ${previewVars["--text"]};
        font-family: ${previewVars["--font-family"]};
        border: 2px solid ${previewVars["--primary"]};
      }
      .${dynamicStyles.themeLivePreviewButtonDynamic} {
        background: ${previewVars["--primary"]};
        color: ${previewVars["--text"]};
      }
    `;
    return () => {
      // Optionally clean up
    };
  }, [previewVars]);

  const handleChange = (key: string, value: string) => {
    setPreviewVars((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await updateCustomVariables(previewVars);
    // Optionally show a toast/notification
  };

  return (
    <div className={styles.themeLivePreview}>
      <h2 className={styles.themeLivePreviewHeader}>Live Theme Preview</h2>
      <div className={styles.themeLivePreviewFlex}>
        <div>
          <label>
            Primary Color:
            <input
              type="color"
              value={previewVars["--primary"]}
              onChange={(e) => handleChange("--primary", e.target.value)}
              className={styles.themeLivePreviewInput}
            />
          </label>
          <br />
          <label>
            Background Color:
            <input
              type="color"
              value={previewVars["--background"]}
              onChange={(e) => handleChange("--background", e.target.value)}
              className={styles.themeLivePreviewInput}
            />
          </label>
          <br />
          <label>
            Surface Color:
            <input
              type="color"
              value={previewVars["--surface"]}
              onChange={(e) => handleChange("--surface", e.target.value)}
              className={styles.themeLivePreviewInput}
            />
          </label>
          <br />
          <label>
            Text Color:
            <input
              type="color"
              value={previewVars["--text"]}
              onChange={(e) => handleChange("--text", e.target.value)}
              className={styles.themeLivePreviewInput}
            />
          </label>
          <br />
          <label>
            Font Family:
            <input
              type="text"
              value={previewVars["--font-family"]}
              onChange={(e) => handleChange("--font-family", e.target.value)}
              className={styles.themeLivePreviewInput}
            />
          </label>
          <br />
          <button
            onClick={handleSave}
            className={styles.themeLivePreviewButton + " " + dynamicStyles.themeLivePreviewButtonDynamic}
          >
            Save Changes
          </button>
        </div>
        <div
          className={styles.themeLivePreviewArea + " " + dynamicStyles.themeLivePreviewAreaDynamic}
        >
          <h3 className={styles.themeLivePreviewAreaHeader}>Preview Area</h3>
          <p>This area updates live as you change color and font settings above.</p>
          <p className={styles.themeLivePreviewFontSample}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>
    </div>
  );
}

const AdminThemesPage: React.FC = () => {
  return (
    <div className={styles.adminThemesRoot}>
      <h1 className={styles.adminThemesTitle}>Admin Themes Management</h1>
      <p className={styles.adminThemesDesc}>
        Theme creation, editing, activation and CSS variable configuration.
      </p>
      <ThemeLivePreview />
    </div>
  );
};

export default AdminThemesPage;
