import React, { useEffect } from 'react';

const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;

function ensureGoogleAnalytics() {
  if (!enableAnalytics || !gaMeasurementId) return;
  if (typeof window === 'undefined') return;

  if (document.querySelector('script[data-analytics="ga"]')) {
    return;
  }

  const gaScript = document.createElement('script');
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
  gaScript.async = true;
  gaScript.dataset.analytics = 'ga';
  document.head.appendChild(gaScript);

  const inline = document.createElement('script');
  inline.dataset.analytics = 'ga-inline';
  inline.innerHTML = `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${gaMeasurementId}', { anonymize_ip: true });`;
  document.head.appendChild(inline);
}

function ensureAdSense() {
  if (!enableAnalytics || !adsenseClientId) return;
  if (typeof window === 'undefined') return;

  if (document.querySelector('script[data-analytics="adsense"]')) {
    return;
  }

  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    adsenseClientId,
  )}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.analytics = 'adsense';
  document.head.appendChild(script);
}

const AnalyticsScripts: React.FC = () => {
  useEffect(() => {
    try {
      ensureGoogleAnalytics();
      ensureAdSense();
    } catch {
      // Never block app render if analytics injection fails
    }
  }, []);

  return null;
};

export default AnalyticsScripts;
