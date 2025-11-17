import React from 'react';
import { AppState, ValidationResult } from '../types';
import { Image as ImageIcon } from 'lucide-react';
import ImageCard from './ImageCard';
import MosaicLoader from './MosaicLoader';

interface GeneratedQRCodeProps {
  appState: AppState;
  generatedImages: string[] | null;
  validationResults: ValidationResult[];
  referenceImageFile: File | null;
  websiteUrl: string;
  extraPrompt: string;
  onRegenerate: (index: number) => void;
  isProcessing: boolean;
  progress: number;
  isInitialGeneration: boolean;
  onImageClick: (imageBase64: string) => void;
}

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
    referenceImageFile,
    websiteUrl,
    extraPrompt,
    onRegenerate,
    isProcessing,
    progress,
    isInitialGeneration,
    onImageClick
}) => {
  const renderContent = () => {
    switch (appState) {
      case AppState.GENERATING_BASE_QR:
      case AppState.LOADING_THEME:
      case AppState.LOADING_QR_CODE:
      case AppState.VALIDATING:
        return <MosaicLoader progress={progress} appState={appState} />;
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
             <div className="w-full h-full flex flex-col items-center">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedImages.map((img, index) => (
                  <div
                    key={`${index}-${img.slice(0,20)}`}
                    className={`opacity-0 ${isInitialGeneration ? (index % 2 === 0 ? 'animate-break-free-left' : 'animate-break-free-right') : 'animate-fade-in'}`}
                    style={{ animationDelay: isInitialGeneration ? `${index * 150}ms` : '0ms' }}
                  >
                    <ImageCard
                      imageBase64={img}
                      index={index}
                      validationResult={validationResults[index]}
                      referenceImageFile={referenceImageFile}
                      expectedUrl={websiteUrl}
                      extraPrompt={extraPrompt}
                      onRegenerate={onRegenerate}
                      isProcessing={isProcessing}
                      onImageClick={onImageClick}
                    />
                  </div>
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
    <div className="w-full h-full bg-base-200 rounded-xl flex items-center justify-center p-2 lg:p-4 min-h-[400px] overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default GeneratedQRCode;