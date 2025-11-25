
import React from 'react';
import { Link2 } from 'lucide-react';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
}

const URLInput: React.FC<URLInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let url = e.target.value;
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
      onChange(url);
    }
  };
  
  const headingNumber = 1;
  const headingText = "Enter URL to Theme";

  return (
    <div className="w-full">
      <h2 key={headingNumber} className="text-xl font-semibold mb-2 text-base-content flex items-center animate-fade-in-up">
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2 shadow-md shadow-brand-primary/30">{headingNumber}</span>
        {headingText}
      </h2>
      <div className="relative group">
        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content-secondary group-focus-within:text-brand-primary transition-colors duration-300" />
        <input
          type="url"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="https://example.com"
          className="w-full pl-12 pr-4 py-4 text-base bg-base-200 border-2 border-base-300 rounded-2xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all duration-300 ease-out focus:scale-[1.02] shadow-sm focus:shadow-xl"
        />
      </div>
       <p className="text-xs text-base-content-secondary mt-2 pl-1">
        This URL will be used to generate and theme the QR code.
      </p>
    </div>
  );
};

export default URLInput;
