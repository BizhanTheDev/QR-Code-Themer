import React from 'react';
import { QrCode, Settings } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-base-100 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-base-content tracking-tight">
              QR Code <span className="text-brand-primary">Themer</span>
            </h1>
          </div>
          <button 
            onClick={onSettingsClick}
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-base-content-secondary hover:bg-base-300 hover:text-base-content transition-colors"
            aria-label="Open advanced settings"
          >
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Advanced</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;