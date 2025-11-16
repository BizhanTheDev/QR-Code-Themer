import React from 'react';
import { Link2 } from 'lucide-react';
import { QRSource } from '../types';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  source: QRSource;
}

const URLInput: React.FC<URLInputProps> = ({ value, onChange, source }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const headingNumber = source === 'generate' ? 2 : 3;
  const headingText = source === 'generate' 
    ? "Enter URL to Theme" 
    : "Enter Website for Theme";

  return (
    <div className="w-full">
      <h2 key={headingNumber} className="text-xl font-semibold mb-2 text-base-content flex items-center animate-fade-in-up">
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2">{headingNumber}</span>
        {headingText}
      </h2>
      <div className="relative">
        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content-secondary" />
        <input
          type="url"
          value={value}
          onChange={handleChange}
          placeholder="https://example.com"
          className="w-full pl-12 pr-4 py-3 text-base bg-base-200 border-2 border-base-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-shadow"
        />
      </div>
       <p className="text-xs text-base-content-secondary mt-1">
        {source === 'generate' 
          ? "This URL will be used to generate and theme the QR code. (Make sure to include 'https://' in your response)"
          : "The QR code's theme will be based on this URL. (Make sure to include 'https://' in your response)"
        }
      </p>
    </div>
  );
};

export default URLInput;