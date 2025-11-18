import React from 'react';
import { AppState } from '../types';

interface MosaicLoaderProps {
  progress: number;
  appState: AppState;
}

const getStatusText = (appState: AppState): string => {
    switch (appState) {
        case AppState.GENERATING_BASE_QR:
            return "Generating Base QR Code...";
        case AppState.LOADING_THEME:
            return "Analyzing Website Theme...";
        case AppState.LOADING_QR_CODE:
            return "Painting Your QR Code(s)...";
        case AppState.VALIDATING:
            return "Validating Scannability...";
        default:
            return "Processing...";
    }
}

const MosaicBlock: React.FC<{ delay: string }> = ({ delay }) => (
  <div
    className="w-full h-full bg-brand-primary rounded-sm animate-mosaic-pulse"
    style={{ animationDelay: delay }}
  />
);

const MosaicLoader: React.FC<MosaicLoaderProps> = ({ progress, appState }) => {
  const blocks = Array.from({ length: 48 }, (_, i) => (
    <MosaicBlock key={i} delay={`${Math.random() * 1.5}s`} />
  ));

  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center text-center animate-fade-in p-4">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-base-300/20">
        <div className="grid grid-cols-8 grid-rows-6 w-full h-full gap-1 p-1">
          {blocks}
        </div>
        <div className="absolute inset-0 bg-base-200/50 backdrop-blur-sm" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                 <div 
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-1000 ease-out-quad animate-gradient-shift bg-300%"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
             <p className="mt-4 text-lg font-semibold text-white drop-shadow-md">{getStatusText(appState)}</p>
             <p className="text-white/70 text-sm drop-shadow-md">This may take a moment...</p>
        </div>
      </div>
    </div>
  );
};

export default MosaicLoader;