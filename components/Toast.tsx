import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle } from 'lucide-react';

type ToastMessage = {
  id: number;
  message: string;
  type: 'warning' | 'info';
};

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        const dismissTimer = setTimeout(onDismiss, 500); // Wait for exit animation
        return () => clearTimeout(dismissTimer);
      }, 5000); // 5 seconds duration
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) {
    return null;
  }
  
  const animationClass = isExiting ? 'animate-toast-out' : 'animate-toast-in';
  
  const theme = {
    info: {
      bg: 'bg-blue-500/90',
      icon: <Info className="w-5 h-5" />,
    },
    warning: {
      bg: 'bg-yellow-500/90',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
  };

  const currentTheme = theme[toast.type];

  return (
    <div
      key={toast.id}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-3 pr-8 rounded-lg text-white shadow-lg backdrop-blur-md ${animationClass} ${currentTheme.bg}`}
      role="alert"
    >
      {currentTheme.icon}
      <p className="text-sm font-semibold">{toast.message}</p>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(onDismiss, 500);
        }}
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-white/20"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
