import React, { useState } from 'react';
import { X, RefreshCw, SlidersHorizontal, ClipboardList, Info, ExternalLink, Palette, KeyRound } from 'lucide-react';
import { GenerationConfig, BackgroundStyle, GradientConfig, PatternConfig } from '../types';
import { defaultGenerationConfig, defaultExtraPrompt } from '../config/defaults';
import BackgroundSelector from './BackgroundSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: GenerationConfig;
  setConfig: (config: GenerationConfig) => void;
  onResetToDefaults: () => void;
  backgroundStyle: BackgroundStyle;
  setBackgroundStyle: (style: BackgroundStyle) => void;
  gradientConfig: GradientConfig;
  setGradientConfig: (config: GradientConfig) => void;
  patternConfig: PatternConfig;
  setPatternConfig: (config: PatternConfig) => void;
  customImageUrl: string | null;
  setCustomImageUrl: (url: string | null) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
}

const DefaultValue = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-base-content-secondary">{label}:</span>
        <span className="font-mono text-base-content font-medium">{value}</span>
    </div>
);

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { 
    isOpen, 
    onClose, 
    config, 
    setConfig, 
    onResetToDefaults,
    customApiKey,
    setCustomApiKey,
  } = props;

  const [activeTab, setActiveTab] = useState<'advanced' | 'api' | 'theme' | 'defaults'>('advanced');
  
  const handleRandomizeSeed = () => {
    setConfig({ ...config, seed: Math.floor(Math.random() * 1000000) });
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-base-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 id="sidebar-title" className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300" aria-label="Close settings">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-base-300 px-2 sm:px-4">
            <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('advanced')}
                    className={`flex items-center whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'advanced' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-content-secondary'}`}
                >
                    <SlidersHorizontal className="mr-2 h-5 w-5" />
                    <span>Advanced</span>
                </button>
                 <button
                    onClick={() => setActiveTab('api')}
                     className={`flex items-center whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'api' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-content-secondary'}`}
                >
                    <KeyRound className="mr-2 h-5 w-5" />
                    <span>API</span>
                </button>
                 <button
                    onClick={() => setActiveTab('theme')}
                     className={`flex items-center whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'theme' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-content-secondary'}`}
                >
                    <Palette className="mr-2 h-5 w-5" />
                    <span>Theme</span>
                </button>
                <button
                    onClick={() => setActiveTab('defaults')}
                     className={`flex items-center whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'defaults' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-content-secondary'}`}
                >
                    <ClipboardList className="mr-2 h-5 w-5" />
                    <span>Defaults</span>
                </button>
            </nav>
        </div>

        <div className="overflow-y-auto h-[calc(100%-121px)]">
          {activeTab === 'advanced' && (
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="seed" className="block text-sm font-medium text-base-content-secondary mb-1">Seed</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="seed"
                    value={config.seed ?? ''}
                    onChange={(e) => setConfig({ ...config, seed: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    placeholder="Random"
                    className="w-full px-3 py-2 text-base bg-base-200 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-shadow"
                  />
                  <button onClick={handleRandomizeSeed} title="Randomize Seed" className="p-2 bg-base-300 rounded-lg hover:bg-brand-primary hover:text-white transition-colors">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-base-content-secondary mt-1">Controls randomness. Same seed + prompt = same image.</p>
              </div>
              
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-base-content-secondary mb-1">Creativity (Temperature): {config.temperature}</label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                 <p className="text-xs text-base-content-secondary mt-1">Lower values are more predictable, higher are more creative.</p>
              </div>

              <div>
                <label htmlFor="topP" className="block text-sm font-medium text-base-content-secondary mb-1">Style Focus (Top-P): {config.topP}</label>
                <input
                  type="range"
                  id="topP"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.topP}
                  onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <p className="text-xs text-base-content-secondary mt-1">Alternative to creativity sampling.</p>
              </div>

              <div>
                <label htmlFor="topK" className="block text-sm font-medium text-base-content-secondary mb-1">Token Variety (Top-K): {config.topK}</label>
                 <input
                  type="range"
                  id="topK"
                  min="1"
                  max="100"
                  step="1"
                  value={config.topK}
                  onChange={(e) => setConfig({ ...config, topK: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                 <p className="text-xs text-base-content-secondary mt-1">Limits the prediction to the K most likely tokens.</p>
              </div>
            </div>
          )}
          {activeTab === 'api' && (
             <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-2">
                  <KeyRound className="h-5 w-5" />
                  Custom API Key
                </h3>
                <p className="text-xs text-base-content-secondary mb-3">
                  Optionally use your own Gemini API key. Your key is only used in your browser for this session and is never saved.
                </p>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-base bg-base-200 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-shadow"
                  />
                  {customApiKey && (
                    <button 
                      onClick={() => setCustomApiKey('')} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-base-content-secondary hover:text-white"
                      title="Clear API Key"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {customApiKey ? (
                  <p className="text-xs text-green-400 mt-1">Custom API key is active for this session.</p>
                ) : (
                  <p className="text-xs text-base-content-secondary mt-1">Using the site's default API key.</p>
                )}
              </div>

               <div className="border-t border-base-300 !mt-6 pt-6">
                <h3 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5" />
                  API Usage & Limits
                </h3>
                <div className="bg-base-200 p-3 rounded-lg border border-base-300 mb-4">
                  <h4 className="font-semibold text-sm text-base-content">Daily Generation Limit</h4>
                  <p className="text-xs text-base-content-secondary mt-1">
                    To ensure fair use with the site's API key, there is a limit of 10 generations per user, per day. This is tracked using a cookie in your browser and resets automatically.
                  </p>
                </div>
                <p className="text-sm text-base-content-secondary">
                  The application's shared API key operates within the Gemini API free tier. For high-volume usage, it's recommended to use your own API key with billing enabled.
                </p>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/models/gemini#rate-limits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-lg text-base-content transition-all duration-200 ease-in-out bg-base-300 hover:bg-brand-secondary hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Gemini API Limits
                </a>
              </div>
            </div>
          )}
          {activeTab === 'defaults' && (
            <div className="p-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-base-content">Generation Defaults</h3>
                        <p className="text-sm text-base-content-secondary">
                            These are the initial settings loaded when the app starts. To change these values permanently, edit the file at: <br />
                            <code className="text-xs bg-base-200 p-1 rounded-md inline-block mt-1">config/defaults.ts</code>
                        </p>
                        <div className="mt-2 space-y-4 rounded-lg bg-base-200 p-4 border border-base-300">
                            <DefaultValue label="Seed" value={defaultGenerationConfig.seed ?? 'Random'} />
                            <DefaultValue label="Creativity (Temperature)" value={defaultGenerationConfig.temperature} />
                            <DefaultValue label="Style Focus (Top-P)" value={defaultGenerationConfig.topP} />
                            <DefaultValue label="Token Variety (Top-K)" value={defaultGenerationConfig.topK} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-base-content">Default Creative Prompt</h3>
                         <p className="text-sm text-base-content-secondary">
                            This text is automatically added to the prompt for every generation. Edit the default value in: <br />
                            <code className="text-xs bg-base-200 p-1 rounded-md inline-block mt-1">config/defaults.ts</code>
                        </p>
                        <div className="mt-2 rounded-lg bg-base-200 p-4 border border-base-300">
                            <p className="text-sm font-mono text-base-content-secondary">{defaultExtraPrompt}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                          onResetToDefaults();
                          // Optional: switch back to the advanced tab to see the changes
                          setActiveTab('advanced');
                        }}
                        className="w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg text-base-content transition-all duration-200 ease-in-out bg-base-300 hover:bg-brand-primary hover:text-white mt-6"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset Current Settings to Defaults
                    </button>
                </div>
            </div>
          )}
          {activeTab === 'theme' && (
            <div className="p-6">
              <BackgroundSelector {...props} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
