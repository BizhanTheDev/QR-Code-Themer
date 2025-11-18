import React, { useState } from 'react';
import { X, RefreshCw, SlidersHorizontal, ClipboardList, Info, ExternalLink, Palette, KeyRound, History, Trash2, Download, AlertTriangle } from 'lucide-react';
import { GenerationConfig, BackgroundStyle, GradientConfig, PatternConfig, HistoryItem, QRShape } from '../types';
import { defaultGenerationConfig } from '../config/defaults';
import BackgroundSelector from './BackgroundSelector';
import GenerationControls from './GenerationControls';

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
  readability: number;
  setReadability: (value: number) => void;
  styleStrength: number;
  setStyleStrength: (value: number) => void;
  creativity: number;
  setCreativity: (value: number) => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onImageClick: (imageBase64: string) => void;
  shape: QRShape;
  setShape: (value: QRShape) => void;
  isGlassTheme: boolean;
  setIsGlassTheme: (value: boolean) => void;
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
    history,
    onClearHistory,
    onImageClick,
    isGlassTheme,
    setIsGlassTheme,
  } = props;

  const [activeTab, setActiveTab] = useState<'advanced' | 'history' | 'api' | 'theme' | 'defaults'>('advanced');
  
  const handleRandomizeSeed = () => {
    setConfig({ ...config, seed: Math.floor(Math.random() * 1000000) });
  };
  
  const handleDownloadAll = (item: HistoryItem) => {
    item.images.forEach((imageBase64, index) => {
      // Sanitize the URL
      const sanitizedUrl = item.url
        .replace(/^https?:\/\/(www\.)?/, '')
        .replace(/\/$/, '')
        .replace(/[^a-z0-9\.]+/gi, '-')
        .substring(0, 50);

      // Sanitize the prompt
      const sanitizedPrompt = item.extraPrompt
        .replace(/[^a-z0-9\s]+/gi, '')
        .trim()
        .split(/\s+/)
        .slice(0, 5)
        .join('-')
        .toLowerCase();
      
      const filename = sanitizedPrompt
        ? `qr-code-${sanitizedUrl}-${sanitizedPrompt}-${index + 1}.png`
        : `qr-code-${sanitizedUrl}-${index + 1}.png`;

      const link = document.createElement('a');
      link.href = `data:image/png;base64,${imageBase64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const TabButton: React.FC<{
      target: typeof activeTab, 
      icon: React.ElementType, 
      label: string, 
      current: typeof activeTab, 
      setter: (tab: typeof activeTab) => void
    }> = ({ target, icon: Icon, label, current, setter }) => (
    <button
        onClick={() => setter(target)}
        className={`flex items-center whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-all duration-200 ease-out-quad hover:bg-base-300/40 rounded-t-md transform hover:-translate-y-px ${current === target ? 'border-brand-primary text-brand-primary' : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-content-secondary'}`}
    >
        <Icon className="mr-2 h-5 w-5" />
        <span>{label}</span>
    </button>
  );

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
        className={`fixed top-0 right-0 h-full w-full max-w-2xl shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${isGlassTheme ? 'bg-base-100/50 backdrop-blur-lg border-l border-white/10' : 'bg-base-100'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 id="sidebar-title" className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300" aria-label="Close settings">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-base-300 px-2 sm:px-4">
            <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                <TabButton target="advanced" icon={SlidersHorizontal} label="Advanced" current={activeTab} setter={setActiveTab} />
                <TabButton target="history" icon={History} label="History" current={activeTab} setter={setActiveTab} />
                <TabButton target="theme" icon={Palette} label="Theme" current={activeTab} setter={setActiveTab} />
                <TabButton target="api" icon={KeyRound} label="API" current={activeTab} setter={setActiveTab} />
                <TabButton target="defaults" icon={ClipboardList} label="Defaults" current={activeTab} setter={setActiveTab} />
            </nav>
        </div>

        <div className="overflow-y-auto h-[calc(100%-121px)] styled-scrollbar">
          {activeTab === 'history' && (
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-base-content">Generation History</h3>
                    {history.length > 0 && (
                        <button 
                            onClick={onClearHistory}
                            className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear History
                        </button>
                    )}
                </div>
                <div className="flex items-start gap-2 p-3 text-xs text-yellow-200 bg-yellow-600/20 rounded-lg border border-yellow-500/30 mb-4">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0 text-yellow-400" />
                    <span>
                        History is stored in your browser's local storage and may be cleared automatically. Download any QR codes you want to keep.
                    </span>
                </div>
                {history.length === 0 ? (
                    <div className="text-center py-10">
                        <History className="mx-auto h-12 w-12 text-base-300" />
                        <p className="mt-2 text-base-content-secondary">No past generations found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map(item => (
                            <div key={item.id} className="bg-base-200 p-3 rounded-lg border border-base-300">
                                <div className="flex items-start gap-4">
                                    <div className="flex-grow overflow-hidden">
                                        <p className="text-sm font-semibold text-base-content truncate" title={item.url}>{item.url}</p>
                                        <p className="text-xs text-base-content-secondary truncate italic">"{item.extraPrompt || 'No creative details'}"</p>
                                        <p className="text-xs text-base-content-secondary mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleDownloadAll(item)}
                                      className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-white bg-brand-primary/10 hover:bg-brand-primary/80 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        All
                                    </button>
                                </div>
                                <div className="mt-3 grid grid-cols-4 gap-2">
                                  {item.images.map((img, index) => {
                                    const handleDownloadSingle = () => {
                                      const sanitizedUrl = item.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').replace(/[^a-z0-9\.]+/gi, '-').substring(0, 50);
                                      const sanitizedPrompt = item.extraPrompt.replace(/[^a-z0-9\s]+/gi, '').trim().split(/\s+/).slice(0, 5).join('-').toLowerCase();
                                      const filename = sanitizedPrompt ? `qr-code-${sanitizedUrl}-${sanitizedPrompt}-${index + 1}.png` : `qr-code-${sanitizedUrl}-${index + 1}.png`;
                                      const link = document.createElement('a');
                                      link.href = `data:image/png;base64,${img}`;
                                      link.download = filename;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    };
                                    return (
                                      <div key={index} className="relative group">
                                        <img
                                          src={`data:image/png;base64,${img}`}
                                          alt={`History thumbnail ${index + 1}`}
                                          className="w-full aspect-square rounded-md object-contain bg-white cursor-pointer transition-transform duration-200 group-hover:scale-105"
                                          onClick={() => onImageClick(img)}
                                        />
                                        <button
                                          onClick={handleDownloadSingle}
                                          className="absolute bottom-1 right-1 p-1.5 bg-base-100/70 backdrop-blur-sm rounded-full text-base-content-secondary hover:text-white hover:bg-brand-primary transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                                          aria-label="Download this image"
                                          title="Download this image"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
          {activeTab === 'advanced' && (
            <div className="p-6">
                <div className="space-y-6">
                  <div>
                      <h3 className="text-lg font-semibold text-base-content mb-3">Creative Controls</h3>
                      <GenerationControls 
                        readability={props.readability}
                        setReadability={props.setReadability}
                        styleStrength={props.styleStrength}
                        setStyleStrength={props.setStyleStrength}
                        creativity={props.creativity}
                        setCreativity={props.setCreativity}
                      />
                  </div>
                  <div className="border-t border-base-300 !mt-6 pt-6">
                      <h3 className="text-lg font-semibold text-base-content mb-3">Model Parameters</h3>
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
                            <button onClick={handleRandomizeSeed} title="Randomize Seed" className="p-2 bg-base-300 rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-200 transform hover:scale-110 hover:rotate-12">
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-xs text-base-content-secondary mt-1">Controls randomness. Same seed + prompt = same image.</p>
                      </div>

                      <div className="mt-4">
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

                      <div className="mt-4">
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-base-content-secondary hover:text-white hover:bg-red-500/50 rounded-full transition-all"
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
                    To ensure fair use, the site's API key has a daily limit based on the number of images generated. This is tracked in your browser and resets automatically.
                  </p>
                </div>
                <p className="text-sm text-base-content-secondary">
                  The application's shared API key operates within the Gemini API free tier. For high-volume usage, it's recommended to use your own API key with billing enabled.
                </p>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/models/gemini#rate-limits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-lg text-base-content transition-all duration-200 ease-in-out bg-base-300 hover:bg-brand-secondary hover:text-white transform hover:scale-105"
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

                    <button 
                        onClick={() => {
                          onResetToDefaults();
                          // Optional: switch back to the advanced tab to see the changes
                          setActiveTab('advanced');
                        }}
                        className="w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg text-base-content transition-all duration-200 ease-in-out bg-base-300 hover:bg-brand-primary hover:text-white transform hover:scale-105"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset Current Settings to Defaults
                    </button>
                </div>
            </div>
          )}
          {activeTab === 'theme' && (
            <div className="p-6">
              <div className="space-y-6">
                  <div>
                    <BackgroundSelector {...props} />
                  </div>
                   <div className="border-t border-base-300 pt-6">
                        <h3 className="text-lg font-semibold text-base-content mb-3">UI Effect</h3>
                        <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg border border-base-300">
                          <div className="flex-grow">
                            <label htmlFor="isGlass" className="font-medium text-base-content">Liquid Glass Effect</label>
                            <p className="text-xs text-base-content-secondary mt-1">Apply a semi-transparent, blurred effect to the UI.</p>
                          </div>
                           <label htmlFor="isGlass" className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                                <input 
                                    type="checkbox" 
                                    id="isGlass"
                                    checked={isGlassTheme}
                                    onChange={(e) => setIsGlassTheme(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-base-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                            </label>
                        </div>
                    </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;