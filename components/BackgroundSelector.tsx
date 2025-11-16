import React, { useRef, useEffect } from 'react';
import { Layers, Image as ImageIcon, Sparkles, Camera, Trash2 } from 'lucide-react';
import { BackgroundStyle, GradientConfig, PatternConfig } from '../types';
import GradientEditor from './GradientEditor';
import PatternEditor from './PatternEditor';

interface BackgroundSelectorProps {
  backgroundStyle: BackgroundStyle;
  setBackgroundStyle: (style: BackgroundStyle) => void;
  gradientConfig: GradientConfig;
  setGradientConfig: (config: GradientConfig) => void;
  patternConfig: PatternConfig;
  setPatternConfig: (config: PatternConfig) => void;
  customImageUrl: string | null;
  setCustomImageUrl: (url: string | null) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = (props) => {
  const {
    backgroundStyle: selected,
    setBackgroundStyle: setSelected,
    customImageUrl,
    setCustomImageUrl,
  } = props;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    // Cleanup function to revoke the object URL when the component unmounts
    // or when the image is cleared.
    return () => {
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
      const newUrl = URL.createObjectURL(file);
      currentObjectUrl.current = newUrl;
      setCustomImageUrl(newUrl);
      setSelected('image');
    }
  };

  const handleRemoveImage = () => {
    setCustomImageUrl(null);
    if (currentObjectUrl.current) {
      URL.revokeObjectURL(currentObjectUrl.current);
      currentObjectUrl.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (selected === 'image') {
      setSelected('default');
    }
  };

  const options: { id: BackgroundStyle; name: string; icon: React.ElementType }[] = [
    { id: 'default', name: 'Default', icon: Layers },
    { id: 'gradient', name: 'Gradient', icon: Sparkles },
    { id: 'pattern', name: 'Pattern', icon: ImageIcon },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-base-content mb-3">UI Background</h3>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => (
          <div key={option.id}>
            <button
              onClick={() => setSelected(option.id)}
              className={`flex items-center gap-3 w-full p-4 rounded-lg border-2 transition-all duration-200 ease-in-out text-left
                ${
                  selected === option.id
                    ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-md'
                    : 'bg-base-200 border-base-300 text-base-content-secondary hover:border-brand-secondary hover:text-base-content'
                }`}
            >
              <option.icon className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold">{option.name}</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${selected === option.id ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pt-3">
                    {option.id === 'gradient' && <GradientEditor config={props.gradientConfig} setConfig={props.setGradientConfig} />}
                    {option.id === 'pattern' && <PatternEditor config={props.patternConfig} setConfig={props.setPatternConfig} />}
                </div>
            </div>
          </div>
        ))}
        
        {/* Image Upload Option */}
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp, image/gif"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 w-full p-4 rounded-lg border-2 transition-all duration-200 ease-in-out text-left
                ${
                    selected === 'image'
                    ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-md'
                    : 'bg-base-200 border-base-300 text-base-content-secondary hover:border-brand-secondary hover:text-base-content'
                }`}
            >
                <Camera className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold">Upload Image</span>
            </button>
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${selected === 'image' ? 'max-h-96' : 'max-h-0'}`}>
                {customImageUrl && (
                    <div className="p-3 bg-base-200 mt-2 rounded-lg border border-base-300 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <img src={customImageUrl} alt="Background preview" className="w-12 h-12 object-cover rounded-md" />
                         <span className="text-sm text-base-content-secondary">Custom background active.</span>
                       </div>
                        <button onClick={handleRemoveImage} className="p-2 rounded-full hover:bg-red-500/20 text-red-400">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>

      </div>
      <p className="text-xs text-base-content-secondary mt-4">
        Change the visual style of the application background.
      </p>
    </div>
  );
};

export default BackgroundSelector;
