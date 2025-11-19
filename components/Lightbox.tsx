import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
  imageSrc: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ imageSrc, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Disable body scroll when the lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for the animation to finish before calling the parent's onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Allow closing with the Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const animationClass = isClosing ? 'animate-lightbox-out' : 'animate-lightbox-in';
  const backdropAnimationClass = isClosing ? 'opacity-0' : 'opacity-100';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      aria-labelledby="lightbox-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${backdropAnimationClass}`}
        onClick={handleClose}
      />

      {/* Content */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] p-2 bg-base-200 rounded-xl shadow-2xl ${animationClass}`}
      >
        <img
          src={`data:image/png;base64,${imageSrc}`}
          alt="Enlarged QR code"
          className="w-full h-auto max-h-[calc(90vh-1rem)] object-contain rounded-lg"
        />
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center bg-base-100 rounded-full text-base-content-secondary hover:text-white hover:bg-brand-primary hover:rotate-90 transition-all duration-300 ease-out-quad shadow-lg"
          aria-label="Close image view"
        >
          <X className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default Lightbox;