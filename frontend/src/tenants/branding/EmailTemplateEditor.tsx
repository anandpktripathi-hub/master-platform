import React from 'react';

export const EmailTemplateEditor: React.FC<{ template: string; onChange: (template: string) => void }> = ({ template, onChange }) => (
  <div>
    <label>Email Template:</label>
    <textarea value={template} onChange={e => onChange(e.target.value)} rows={6} />
  </div>
);

export default EmailTemplateEditor;
