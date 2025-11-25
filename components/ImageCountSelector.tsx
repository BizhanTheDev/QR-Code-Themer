
import React from 'react';

interface ImageCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const ImageCountSelector: React.FC<ImageCountSelectorProps> = ({ value, onChange }) => {
  const options = [1, 2, 3, 4];
  const headingNumber = 3;

  return (
    <div className="w-full">
      <h2 key={headingNumber} className="text-xl font-semibold mb-3 text-base-content flex items-center animate-fade-in-up">
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2 shadow-md shadow-brand-primary/30">{headingNumber}</span>
        Select Variations
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`py-3 px-4 rounded-2xl text-center font-bold text-lg transition-all duration-300 ease-out-quad border-2 transform
              ${
                value === option
                  ? 'bg-brand-primary border-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/40'
                  : 'bg-base-200 border-base-300 text-base-content-secondary hover:border-brand-secondary hover:text-base-content hover:scale-105 active:scale-95'
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
