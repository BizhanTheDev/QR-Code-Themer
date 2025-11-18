import React from 'react';
import { PatternConfig, QRShape } from '../types';
import ShapeSelector from './ShapeSelector';

interface PatternEditorProps {
  config: PatternConfig;
  setConfig: (config: PatternConfig) => void;
  shape: QRShape;
  setShape: (value: QRShape) => void;
}

const PatternEditor: React.FC<PatternEditorProps> = ({ config, setConfig, shape, setShape }) => {
  return (
    <div className="p-4 bg-base-200 rounded-lg border border-base-300 space-y-4">
        {shape === 'fluid' ? (
           <div className="space-y-4">
             <div>
                <label htmlFor="fluidComplexity" className="block text-sm font-medium text-base-content-secondary mb-1">Complexity: {config.fluidComplexity}</label>
                <input
                    type="range"
                    id="fluidComplexity"
                    min="2"
                    max="10"
                    step="1"
                    value={config.fluidComplexity}
                    onChange={(e) => setConfig({ ...config, fluidComplexity: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
             </div>
             <div>
                <label htmlFor="fluidSpeed" className="block text-sm font-medium text-base-content-secondary mb-1">Speed: {config.fluidSpeed}</label>
                <input
                    type="range"
                    id="fluidSpeed"
                    min="10"
                    max="100"
                    step="5"
                    value={config.fluidSpeed}
                    onChange={(e) => setConfig({ ...config, fluidSpeed: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
             </div>
              <div>
                <label htmlFor="fluidSize" className="block text-sm font-medium text-base-content-secondary mb-1">Size: {config.size}</label>
                <input
                    type="range"
                    id="fluidSize"
                    min="20"
                    max="80"
                    step="5"
                    value={config.size}
                    onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="fluidBlur" className="text-sm text-base-content-secondary">Background Blur</label>
                <label htmlFor="fluidBlur" className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="fluidBlur"
                        checked={config.fluidBlur}
                        onChange={(e) => setConfig({ ...config, fluidBlur: e.target.checked })}
                        className="sr-only peer" />
                    <div className="w-11 h-6 bg-base-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
            </div>
            <p className="text-xs text-center text-base-content-secondary !mt-2">
                Fluid pattern uses colors from the <strong>Gradient</strong> settings.
            </p>
           </div>
        ) : (
          <>
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
             <div>
                <label htmlFor="size" className="block text-sm font-medium text-base-content-secondary mb-1">Pattern Size: {config.size}</label>
                <input
                    type="range"
                    id="size"
                    min="5"
                    max="50"
                    step="1"
                    value={config.size}
                    onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
            </div>
          </>
        )}

        <div className="border-t border-base-300 !mt-4 pt-4">
            <label className="block text-sm font-medium text-base-content-secondary mb-2">Pattern Shape</label>
            <ShapeSelector value={shape} onChange={setShape} />
        </div>
    </div>
  );
};

export default PatternEditor;