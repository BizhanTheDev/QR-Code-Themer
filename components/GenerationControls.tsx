import React from 'react';

interface GenerationControlsProps {
  readability: number;
  setReadability: (value: number) => void;
  styleStrength: number;
  setStyleStrength: (value: number) => void;
  creativity: number;
  setCreativity: (value: number) => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; helpText: string; }> = ({ label, value, onChange, min = 0, max = 1, step = 0.01, helpText }) => (
  <div>
    <label htmlFor={label} className="block text-sm font-medium text-base-content-secondary mb-1">{label}: {value.toFixed(2)}</label>
    <input
      type="range"
      id={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-brand-primary"
    />
    <p className="text-xs text-base-content-secondary mt-1">{helpText}</p>
  </div>
);


const GenerationControls: React.FC<GenerationControlsProps> = (props) => {
  const {
    readability,
    setReadability,
    styleStrength,
    setStyleStrength,
    creativity,
    setCreativity
  } = props;

  return (
    <div className="space-y-4">
      <Slider
        label="Readability"
        value={readability}
        onChange={(e) => setReadability(parseFloat(e.target.value))}
        helpText="Higher values prioritize scannability and contrast. Lower values allow more artistic freedom."
      />
      <Slider
        label="Style Strength"
        value={styleStrength}
        onChange={(e) => setStyleStrength(parseFloat(e.target.value))}
        helpText="Controls how strongly the theme is applied. Higher values are more artistic."
      />
        <Slider
        label="Creativity"
        value={creativity}
        onChange={(e) => setCreativity(parseFloat(e.target.value))}
        helpText="Lower values are more predictable, higher values are more unique and random."
      />
    </div>
  );
};

export default GenerationControls;