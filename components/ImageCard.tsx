
import React, { useMemo } from 'react';
import { ValidationResult } from '../types';
import { CheckCircle, XCircle, RefreshCw, Download, ScanLine, AlertTriangle } from 'lucide-react';

interface ImageCardProps {
  imageBase64: string;
  index: number;
  validationResult: ValidationResult | undefined;
  referenceImageFile: File | null;
  expectedUrl: string;
  extraPrompt: string;
  onRegenerate: (index: number) => void;
  isProcessing: boolean;
  onImageClick: (imageBase64: string) => void;
}


const ImageCard: React.FC<ImageCardProps> = ({ 
  imageBase64, 
  index,
  validationResult,
  referenceImageFile,
  expectedUrl,
  extraPrompt,
  onRegenerate,
  isProcessing,
  onImageClick
}) => {
  
  const themedFilename = useMemo(() => {
    // Sanitize the URL to create a valid filename
    const sanitizedUrl = expectedUrl
      .replace(/^https?:\/\/(www\.)?/, '') // remove protocol and www
      .replace(/\/$/, '') // remove trailing slash
      .replace(/[^a-z0-9\.]+/gi, '-') // replace invalid chars with hyphens
      .substring(0, 50); // Truncate to a reasonable length

    // Sanitize and include the extra prompt
    const sanitizedPrompt = extraPrompt
      .replace(/[^a-z0-9\s]+/gi, '') // remove special chars
      .trim()
      .split(/\s+/) // split into words
      .slice(0, 5) // take the first 5 words
      .join('-')
      .toLowerCase();

    if (sanitizedPrompt) {
        return `qr-code-${sanitizedUrl}-${sanitizedPrompt}-${index + 1}.png`;
    }
    return `qr-code-${sanitizedUrl}-${index + 1}.png`;
  }, [expectedUrl, extraPrompt, index]);

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
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <ScanLine className="w-3.5 h-3.5 animate-pulse"/>
            <span>Validating...</span>
          </div>
        );
      case 'valid':
        const isMatch = validationResult.data === expectedUrl;
        return isMatch ? (
          <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Scannable &amp; Matches URL</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm" title={`Expected: ${expectedUrl}\nFound: ${validationResult.data}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>URL Mismatch</span>
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <XCircle className="w-3.5 h-3.5"/>
            <span>Not Scannable</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-base-100 p-4 rounded-3xl shadow-lg space-y-4 flex flex-col transition-all duration-300 ease-out-quad hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.01] border border-base-300/50">
      <div 
        className="relative aspect-square cursor-pointer group overflow-hidden rounded-2xl"
        onClick={() => onImageClick(imageBase64)}
      >
        <img 
          src={`data:image/png;base64,${imageBase64}`} 
          alt={`Generated themed QR code ${index + 1}`} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <ScanLine className="w-8 h-8 text-white" />
            </div>
        </div>
        <div className="absolute top-3 left-3">
          <ValidationIndicator />
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          onClick={() => onRegenerate(index)}
          className="flex items-center justify-center gap-2 w-full font-semibold py-3 px-4 rounded-xl text-base-content-secondary transition-all duration-200 ease-in-out bg-base-300/50 hover:bg-base-300 hover:text-base-content hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={validationResult?.status === 'pending' || isProcessing}
        >
          <RefreshCw className={`h-4 w-4 ${validationResult?.status === 'pending' || isProcessing ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 w-full font-semibold py-3 px-4 rounded-xl text-white transition-all duration-200 ease-in-out bg-brand-primary hover:bg-brand-primary/90 hover:shadow-lg hover:shadow-brand-primary/30 hover:scale-105 active:scale-95"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
};

export default ImageCard;
