
import React from 'react';

interface ExtraPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ExtraPromptInput: React.FC<ExtraPromptInputProps> = ({ value, onChange }) => {
  const headingNumber = 4;
  return (
    <div className="w-full">
      <h2 key={headingNumber} className="text-xl font-semibold mb-2 text-base-content flex items-center animate-fade-in-up">
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2 shadow-md shadow-brand-primary/30">{headingNumber}</span>
        Add Creative Details (Optional)
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 'make it look like a neon sign', 'add a small, subtle cat in the corner', 'use a watercolor style'"
        rows={3}
        className="w-full p-4 text-base bg-base-200 border-2 border-base-300 rounded-2xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all duration-300 ease-out focus:scale-[1.02] shadow-sm focus:shadow-xl resize-none"
      />
      <p className="text-xs text-base-content-secondary mt-2 pl-1">Optional: Add extra instructions to guide the design.</p>
    </div>
  );
};

export default ExtraPromptInput;
