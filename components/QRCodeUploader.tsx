import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface QRCodeUploaderProps {
  onFileChange: (file: File | null) => void;
}

const QRCodeUploader: React.FC<QRCodeUploaderProps> = ({ onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
      onFileChange(file);
    } else {
      // Reset if no file or non-image file is selected
      setPreview(null);
      setFileName('');
      onFileChange(null);
    }
  }, [onFileChange]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClear = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-2 text-base-content flex items-center">
        <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex-shrink-0 inline-flex items-center justify-center text-sm font-bold mr-2">2</span>
        Upload QR Code
      </h2>
      <label
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-base-300 border-dashed rounded-xl cursor-pointer bg-base-200 hover:bg-base-300/60 transition-colors duration-200 ease-in-out ${preview ? 'p-2' : 'p-5'}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="QR Code Preview" className="max-h-full max-w-full object-contain rounded-md" />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleClear();
              }}
              className="absolute top-2 right-2 p-1.5 bg-base-100 rounded-full text-base-content-secondary hover:bg-red-100 hover:text-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="absolute bottom-2 left-2 p-1 px-2 text-xs bg-base-100 rounded-md truncate max-w-[calc(100%-1rem)]">{fileName}</p>
          </>
        ) : (
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-base-content-secondary" />
            <p className="mt-2 text-lg font-semibold text-base-content">
              Click to upload or drag & drop
            </p>
            <p className="text-sm text-base-content-secondary">PNG, JPG, WEBP</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
        />
      </label>
    </div>
  );
};

export default QRCodeUploader;