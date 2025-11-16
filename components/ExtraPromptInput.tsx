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
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2">{headingNumber}</span>
        Add Creative Details
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 'make it look like a neon sign', 'add a small, subtle cat in the corner', 'use a watercolor style'"
        rows={3}
        className="w-full p-3 text-base bg-base-200 border-2 border-base-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-shadow"
      />
      <p className="text-xs text-base-content-secondary mt-1">Optional: Add extra instructions to guide the design.</p>
    </div>
  );
};

export default ExtraPromptInput;