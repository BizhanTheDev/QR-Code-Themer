import React from 'react';
import { Upload, Link2 } from 'lucide-react';
import { QRSource } from '../types';

interface SourceSelectorProps {
  source: QRSource;
  setSource: (source: QRSource) => void;
}

const SourceSelector: React.FC<SourceSelectorProps> = ({ source, setSource }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2 text-base-content flex items-center">
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2">1</span>
        QR Code Source
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSource('upload')}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ease-in-out ${
            source === 'upload'
              ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-md'
              : 'bg-base-200 border-base-300 text-base-content-secondary hover:border-brand-secondary hover:text-base-content'
          }`}
        >
          <Upload className="w-6 h-6" />
          <span className="font-semibold">Upload Image</span>
        </button>
        <button
          onClick={() => setSource('generate')}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ease-in-out ${
            source === 'generate'
              ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-md'
              : 'bg-base-200 border-base-300 text-base-content-secondary hover:border-brand-secondary hover:text-base-content'
          }`}
        >
          <Link2 className="w-6 h-6" />
          <span className="font-semibold">From URL</span>
        </button>
      </div>
    </div>
  );
};

export default SourceSelector;