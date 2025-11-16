import React, { useMemo } from 'react';
import { ValidationResult } from '../types';
import { CheckCircle, XCircle, RefreshCw, Download, ScanLine, AlertTriangle } from 'lucide-react';

interface ImageCardProps {
  imageBase64: string;
  index: number;
  validationResult: ValidationResult | undefined;
  referenceImageFile: File | null;
  expectedUrl: string;
  onRegenerate: (index: number) => void;
}


const ImageCard: React.FC<ImageCardProps> = ({ 
  imageBase64, 
  index,
  validationResult,
  referenceImageFile,
  expectedUrl,
  onRegenerate
}) => {
  
  const themedFilename = useMemo(() => {
    if (!referenceImageFile) return `themed-qr-code-${index + 1}.png`;
    const nameParts = referenceImageFile.name.split('.');
    nameParts.pop(); // remove extension
    return `${nameParts.join('.')}-themed-${index + 1}.png`;
  }, [referenceImageFile, index]);

  const handleDownload = () => {
    if (!imageBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = themedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ValidationIndicator = () => {
    if (!validationResult) return null;

    switch (validationResult.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-xs text-yellow-400">
            <ScanLine className="w-4 h-4 animate-pulse"/>
            <span>Validating...</span>
          </div>
        );
      case 'valid':
        const isMatch = validationResult.data === expectedUrl;
        return isMatch ? (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Scannable &amp; Matches URL</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-orange-400" title={`Expected: ${expectedUrl}\nFound: ${validationResult.data}`}>
            <AlertTriangle className="w-4 h-4" />
            <span>URL Mismatch</span>
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <XCircle className="w-4 h-4"/>
            <span>Not Scannable</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-base-100 p-3 rounded-xl shadow-md space-y-3 flex flex-col">
      <div className="relative aspect-square">
        <img 
          src={`data:image/png;base64,${imageBase64}`} 
          alt={`Generated themed QR code ${index + 1}`} 
          className="w-full h-full object-contain rounded-md"
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white font-semibold text-xs px-2 py-1 rounded-full">
          <ValidationIndicator />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          onClick={() => onRegenerate(index)}
          className="flex items-center justify-center gap-2 w-full font-semibold py-2 px-4 rounded-lg text-base-content-secondary transition-all duration-200 ease-in-out bg-base-300 hover:bg-base-300/80 hover:text-base-content"
          disabled={validationResult?.status === 'pending'}
        >
          <RefreshCw className={`h-4 w-4 ${validationResult?.status === 'pending' ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 w-full font-semibold py-2 px-4 rounded-lg text-white transition-all duration-200 ease-in-out bg-brand-primary hover:bg-brand-primary/90"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
};

export default ImageCard;