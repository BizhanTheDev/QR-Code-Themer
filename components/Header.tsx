
import React from 'react';
import { QrCode, Settings, Menu } from 'lucide-react';
import { PageView } from '../types';

interface HeaderProps {
  onSettingsClick: () => void;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavLink = ({ page, label }: { page: PageView; label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-base-200 hover:scale-105 active:scale-95 ${
        currentPage === page ? 'bg-brand-primary/10 text-brand-primary font-bold shadow-sm' : 'text-base-content-secondary hover:text-brand-primary'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-base-100/80 backdrop-blur-lg shadow-md sticky top-0 z-40 border-b border-white/5 transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-brand-primary/50">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">
              QR Code <span className="text-brand-primary">Themer</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink page="home" label="Generator" />
            <NavLink page="use-cases" label="Use Cases" />
            <NavLink page="blog" label="Blog" />
            <NavLink page="about" label="About" />
            <div className="h-6 w-px bg-base-300 mx-2"></div>
            <button 
              onClick={onSettingsClick}
              className="group flex items-center gap-2 py-2 px-4 rounded-full text-base-content-secondary hover:bg-base-200 hover:text-base-content transition-all duration-200 ease-out-quad transform hover:scale-105 active:scale-95 border border-transparent hover:border-base-300"
              aria-label="Open advanced settings"
            >
              <Settings className="h-5 w-5 transition-transform duration-500 ease-out-quad group-hover:rotate-180 animate-subtle-pulse group-hover:animate-none" />
              <span className="font-medium">Settings</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
                onClick={onSettingsClick}
                className="p-2 text-base-content-secondary hover:text-base-content hover:bg-base-200 rounded-full transition-colors"
            >
                <Settings className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-base-content-secondary hover:text-base-content hover:bg-base-200 rounded-full transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-base-300 bg-base-100/95 backdrop-blur-md p-4 space-y-4 animate-fade-in rounded-b-3xl shadow-xl">
          <div className="flex flex-col gap-2">
            <NavLink page="home" label="Generator" />
            <NavLink page="use-cases" label="Use Cases" />
            <NavLink page="blog" label="Blog" />
            <NavLink page="about" label="About" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
