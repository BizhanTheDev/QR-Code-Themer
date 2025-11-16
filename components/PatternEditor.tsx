import React from 'react';
import { PatternConfig } from '../types';

interface PatternEditorProps {
  config: PatternConfig;
  setConfig: (config: PatternConfig) => void;
}

const PatternEditor: React.FC<PatternEditorProps> = ({ config, setConfig }) => {
  return (
    <div className="p-4 bg-base-200 rounded-lg border border-base-300 space-y-4">
        <div className="flex items-center justify-between">
            <label className="text-sm text-base-content-secondary">Pattern Color</label>
            <div className="relative w-8 h-8 rounded-md border border-base-300 overflow-hidden">
                <input
                    type="color"
                    value={config.color}
                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                    className="absolute inset-[-4px] w-10 h-10 cursor-pointer"
                />
            </div>
        </div>
        <div>
            <label htmlFor="opacity" className="block text-sm font-medium text-base-content-secondary mb-1">Opacity: {config.opacity.toFixed(2)}</label>
            <input
                type="range"
                id="opacity"
                min="0"
                max="1"
                step="0.01"
                value={config.opacity}
                onChange={(e) => setConfig({ ...config, opacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
        </div>
    </div>
  );
};

export default PatternEditor;
