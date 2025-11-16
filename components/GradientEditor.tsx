import React from 'react';
import { GradientConfig } from '../types';

interface GradientEditorProps {
  config: GradientConfig;
  setConfig: (config: GradientConfig) => void;
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm text-base-content-secondary">{label}</label>
    <div className="relative w-8 h-8 rounded-md border border-base-300 overflow-hidden">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-[-4px] w-10 h-10 cursor-pointer"
      />
    </div>
  </div>
);

const GradientEditor: React.FC<GradientEditorProps> = ({ config, setConfig }) => {
  return (
    <div className="p-4 bg-base-200 rounded-lg border border-base-300 space-y-4">
      <ColorInput
        label="From Color"
        value={config.fromColor}
        onChange={(value) => setConfig({ ...config, fromColor: value })}
      />
      <ColorInput
        label="Via Color"
        value={config.viaColor}
        onChange={(value) => setConfig({ ...config, viaColor: value })}
      />
      <ColorInput
        label="To Color"
        value={config.toColor}
        onChange={(value) => setConfig({ ...config, toColor: value })}
      />
      
      <div className="border-t border-base-300 !mt-3 pt-3 flex items-center justify-between">
        <label htmlFor="isAnimated" className="text-sm text-base-content-secondary">Live Gradient</label>
        <label htmlFor="isAnimated" className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            id="isAnimated"
            checked={config.isAnimated}
            onChange={(e) => setConfig({ ...config, isAnimated: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-base-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
        </label>
      </div>
    </div>
  );
};

export default GradientEditor;
