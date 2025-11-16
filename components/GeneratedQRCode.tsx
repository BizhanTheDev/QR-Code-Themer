import React from 'react';
import { AppState, ValidationResult } from '../types';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import ImageCard from './ImageCard';

interface GeneratedQRCodeProps {
  appState: AppState;
  generatedImages: string[] | null;
  validationResults: ValidationResult[];
  originalQRCodeFile: File | null;
  websiteUrl: string;
  onRegenerate: (index: number) => void;
}

const LoadingPlaceholder: React.FC<{ text: string }> = ({ text }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in p-4">
        <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
        <p className="mt-4 text-lg font-semibold text-base-content">{text}</p>
        <p className="text-base-content-secondary">This may take a moment...</p>
    </div>
);

const IdlePlaceholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <ImageIcon className="h-16 w-16 text-base-300" />
        <p className="mt-4 text-xl font-semibold text-base-content">Your Themed QR Codes</p>
        <p className="text-base-content-secondary">Will appear here once generated</p>
    </div>
);


const GeneratedQRCode: React.FC<GeneratedQRCodeProps> = ({ 
    appState, 
    generatedImages, 
    validationResults,
    originalQRCodeFile,
    websiteUrl,
    onRegenerate 
}) => {
  const renderContent = () => {
    switch (appState) {
      case AppState.GENERATING_BASE_QR:
        return <LoadingPlaceholder text="Generating Base QR Code..." />;
      case AppState.LOADING_THEME:
        return <LoadingPlaceholder text="Analyzing Website Theme..." />;
      case AppState.LOADING_QR_CODE:
        return <LoadingPlaceholder text="Painting Your QR Code(s)..." />;
      case AppState.VALIDATING:
          return <LoadingPlaceholder text="Validating QR Code(s)..." />;
      case AppState.ERROR:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <ImageIcon className="h-16 w-16 text-red-400/50" />
            <p className="mt-4 text-xl font-semibold text-red-400">Generation Failed</p>
            <p className="text-base-content-secondary">Please check the inputs and try again.</p>
          </div>
        );
      case AppState.SUCCESS:
        if (generatedImages && generatedImages.length > 0) {
          return (
             <div className="w-full h-full flex flex-col items-center animate-fade-in">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedImages.map((img, index) => (
                  <ImageCard
                    key={`${index}-${img.slice(0,20)}`} // Add part of img to key to force re-render on change
                    imageBase64={img}
                    index={index}
                    validationResult={validationResults[index]}
                    originalQRCodeFile={originalQRCodeFile}
                    expectedUrl={websiteUrl}
                    onRegenerate={onRegenerate}
                  />
                ))}
              </div>
            </div>
          );
        }
        return <IdlePlaceholder />;
      case AppState.IDLE:
      default:
        return <IdlePlaceholder />;
    }
  };

  return (
    <div className="w-full h-full bg-base-200 rounded-xl flex items-center justify-center p-2 lg:p-4 min-h-[400px]">
      {renderContent()}
    </div>
  );
};

export default GeneratedQRCode;