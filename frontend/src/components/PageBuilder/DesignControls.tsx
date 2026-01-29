import React, { useEffect, useState } from 'react';
import { Slider } from '@radix-ui/react-slider';
import WebFont from 'webfontloader';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Poppins', 'Merriweather', 'Nunito',
  'Playfair Display', 'Source Sans Pro', 'Work Sans', 'Rubik', 'Quicksand', 'Bebas Neue', 'Fira Sans', 'Cabin', 'PT Sans', 'DM Sans',
  // ...add more for demo, can expand to 300+ in production
];

interface DesignControlsProps {
  padding: number;
  margin: number;
  shadow: string;
  border: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  rotate?: number;
  scale?: number;
  skew?: number;
  onChange: (controls: {
    padding?: number;
    margin?: number;
    shadow?: string;
    border?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    rotate?: number;
    scale?: number;
    skew?: number;
  }) => void;
}

const SHADOW_PRESETS = [
  'shadow-none',
  'shadow-sm',
  'shadow',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-inner',
  'shadow-outline',
  'shadow-outline-blue',
  // ...add more Tailwind shadow presets
];

const BORDER_PRESETS = [
  'border-none',
  'border',
  'border-2',
  'border-4',
  'border-8',
  'border-dashed',
  'border-dotted',
  'border-double',
];


const DesignControls: React.FC<DesignControlsProps> = ({
  padding, margin, shadow, border,
  fontFamily = 'Inter', fontSize = 18, fontWeight = 400, lineHeight = 1.5,
  rotate = 0, scale = 1, skew = 0,
  onChange
}) => {
  // Load selected font for live preview
  useEffect(() => {
    if (fontFamily) {
      WebFont.load({ google: { families: [fontFamily] } });
    }
  }, [fontFamily]);

  return (
    <div className="w-72 bg-white rounded-lg shadow p-4 flex flex-col gap-4">
      <h3 className="font-bold text-lg mb-2">Design Controls</h3>
      {/* Padding */}
      <div>
        <label className="block text-xs font-semibold mb-1">Padding</label>
        <Slider
          min={0}
          max={64}
          step={1}
          value={[padding]}
          onValueChange={([v]) => onChange({ padding: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{padding}px</div>
      </div>
      {/* Margin */}
      <div>
        <label className="block text-xs font-semibold mb-1">Margin</label>
        <Slider
          min={0}
          max={64}
          step={1}
          value={[margin]}
          onValueChange={([v]) => onChange({ margin: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{margin}px</div>
      </div>
      {/* Shadow */}
      <div>
        <label className="block text-xs font-semibold mb-1">Shadow</label>
        <select
          value={shadow}
          onChange={e => onChange({ shadow: e.target.value })}
          className="w-full border rounded p-1 text-xs"
        >
          {SHADOW_PRESETS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {/* Border */}
      <div>
        <label className="block text-xs font-semibold mb-1">Border</label>
        <select
          value={border}
          onChange={e => onChange({ border: e.target.value })}
          className="w-full border rounded p-1 text-xs"
        >
          {BORDER_PRESETS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      {/* Font Family */}
      <div>
        <label className="block text-xs font-semibold mb-1">Font Family</label>
        <select
          value={fontFamily}
          onChange={e => onChange({ fontFamily: e.target.value })}
          className="w-full border rounded p-1 text-xs"
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <div className="mt-1 text-xs" style={{ fontFamily }}>{fontFamily} preview</div>
      </div>
      {/* Font Size */}
      <div>
        <label className="block text-xs font-semibold mb-1">Font Size</label>
        <Slider
          min={10}
          max={72}
          step={1}
          value={[fontSize]}
          onValueChange={([v]) => onChange({ fontSize: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{fontSize}px</div>
      </div>
      {/* Font Weight */}
      <div>
        <label className="block text-xs font-semibold mb-1">Font Weight</label>
        <Slider
          min={100}
          max={900}
          step={100}
          value={[fontWeight]}
          onValueChange={([v]) => onChange({ fontWeight: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{fontWeight}</div>
      </div>
      {/* Line Height */}
      <div>
        <label className="block text-xs font-semibold mb-1">Line Height</label>
        <Slider
          min={1}
          max={3}
          step={0.05}
          value={[lineHeight]}
          onValueChange={([v]) => onChange({ lineHeight: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{lineHeight}</div>
      </div>
      {/* Transform Controls */}
      <div>
        <label className="block text-xs font-semibold mb-1">Rotate</label>
        <Slider
          min={-180}
          max={180}
          step={1}
          value={[rotate]}
          onValueChange={([v]) => onChange({ rotate: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{rotate}°</div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Scale</label>
        <Slider
          min={0.5}
          max={2}
          step={0.01}
          value={[scale]}
          onValueChange={([v]) => onChange({ scale: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{scale}x</div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Skew</label>
        <Slider
          min={-45}
          max={45}
          step={1}
          value={[skew]}
          onValueChange={([v]) => onChange({ skew: v })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{skew}°</div>
      </div>
    </div>
  );
};

export default DesignControls;
