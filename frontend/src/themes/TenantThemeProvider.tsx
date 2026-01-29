import React, { useEffect } from 'react';

interface TenantThemeProviderProps {
  theme: {
    colors: Record<string, string>;
    fontFamily: string;
    customCss?: string;
    customJs?: string;
  };
  children: React.ReactNode;
}

const injectCssVars = (colors: Record<string, string>, fontFamily: string, customCss?: string) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  root.style.setProperty('--font-family', fontFamily);
  if (customCss) {
    let style = document.getElementById('tenant-custom-css') as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = 'tenant-custom-css';
      document.head.appendChild(style);
    }
    style.innerHTML = customCss;
  }
};

const injectJs = (customJs?: string) => {
  if (customJs) {
    let script = document.getElementById('tenant-custom-js') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'tenant-custom-js';
      document.body.appendChild(script);
    }
    script.innerHTML = customJs;
  }
};

const TenantThemeProvider: React.FC<TenantThemeProviderProps> = ({ theme, children }) => {
  useEffect(() => {
    injectCssVars(theme.colors, theme.fontFamily, theme.customCss);
    injectJs(theme.customJs);
    // Hot reload: listen for theme changes (optional, e.g. via context or websocket)
  }, [theme]);

  return <>{children}</>;
};

export default TenantThemeProvider;
