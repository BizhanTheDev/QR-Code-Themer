import React from 'react';
import { Square, Circle, Diamond, Waves } from 'lucide-react';
import { QRShape } from '../types';

interface ShapeSelectorProps {
  value: QRShape;
  onChange: (value: QRShape) => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({ value, onChange }) => {
  const options: { id: QRShape; name: string; icon: React.ElementType }[] = [
    { id: 'squares', name: 'Squares', icon: Square },
    { id: 'circles', name: 'Circles', icon: Circle },
    { id: 'diamonds', name: 'Diamonds', icon: Diamond },
    { id: 'fluid', name: 'Fluid', icon: Waves },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`py-3 px-2 flex flex-col items-center justify-center gap-1.5 rounded-lg text-center font-bold text-sm transition-all duration-200 ease-in-out border-2 transform
              ${
                value === option.id
                  ? 'bg-brand-primary border-brand-primary text-white scale-105 shadow-lg'
                  : 'bg-base-200 border-base-300 text-base-content-secondary hover:border-brand-secondary hover:text-base-content hover:scale-105 active:scale-100'
              }`}
          >
            <option.icon className="w-5 h-5" />
            <span>{option.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-base-content-secondary mt-1">Influences the core shape of the QR code modules.</p>
    </div>
  );
};

export default ShapeSelector;