import React from 'react';

const fonts = ['Arial', 'Roboto', 'Montserrat', 'Lato', 'Open Sans'];

export const FontSelector: React.FC<{ value: string; onChange: (font: string) => void }> = ({ value, onChange }) => (
  <div>
    <label htmlFor="font-selector">Font:</label>
    <select id="font-selector" value={value} onChange={e => onChange(e.target.value)}>
      {fonts.map(font => (
        <option key={font} value={font}>{font}</option>
      ))}
    </select>
  </div>
);

export default FontSelector;
