import React from 'react';

export const BrandingPreview: React.FC<{ logoUrl: string; color: string; font: string; css: string; js: string }> = ({ logoUrl, color, font, css, js }) => (
  <div style={{ border: '1px solid #ccc', padding: 16, fontFamily: font, background: color }}>
    <img src={logoUrl} alt="Logo Preview" style={{ maxWidth: 120, marginBottom: 8 }} />
    <div>Font: {font}</div>
    <div>Custom CSS: <pre>{css}</pre></div>
    <div>Custom JS: <pre>{js}</pre></div>
  </div>
);

export default BrandingPreview;
