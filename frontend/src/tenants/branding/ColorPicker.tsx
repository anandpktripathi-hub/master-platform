import React from 'react';

export const ColorPicker: React.FC<{ color: string; onChange: (color: string) => void }> = ({ color, onChange }) => (
  <div>
    <label htmlFor="color-picker">Primary Color:</label>
    <input
      id="color-picker"
      type="color"
      value={color}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default ColorPicker;
