import React from 'react';
import { Sparkles } from 'lucide-react';
import { QRSource } from '../types';

interface ImageCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  source: QRSource;
}

const ImageCountSelector: React.FC<ImageCountSelectorProps> = ({ value, onChange, source }) => {
  const options = [1, 2, 3, 4];
  const headingNumber = source === 'generate' ? 3 : 4;

  return (
    <div className="w-full">
      <h2 key={headingNumber} className="text-xl font-semibold mb-3 text-base-content flex items-center animate-fade-in-up">
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2">{headingNumber}</span>
        Select Variations
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`py-3 px-4 rounded-lg text-center font-bold text-lg transition-all duration-200 ease-in-out border-2
              ${
                value === option
                  ? 'bg-brand-primary border-brand-primary text-white scale-105 shadow-lg'
                  : 'bg-base-200 border-base-300 text-base-content-secondary hover:border-brand-secondary hover:text-base-content'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageCountSelector;