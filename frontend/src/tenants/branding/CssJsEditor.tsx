import React from 'react';

export const CssJsEditor: React.FC<{ css: string; js: string; onCssChange: (css: string) => void; onJsChange: (js: string) => void }> = ({ css, js, onCssChange, onJsChange }) => (
  <div>
    <label>Custom CSS:</label>
    <textarea value={css} onChange={e => onCssChange(e.target.value)} rows={4} />
    <label>Custom JS:</label>
    <textarea value={js} onChange={e => onJsChange(e.target.value)} rows={4} />
  </div>
);

export default CssJsEditor;
