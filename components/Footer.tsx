
import React from 'react';
import { PageView } from '../types';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-base-100/80 backdrop-blur-xl border-t border-base-300/50 mt-16 rounded-t-3xl shadow-negative-lg">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-base-content mb-4 tracking-tight">QR Code Themer</h3>
            <p className="text-base-content-secondary max-w-sm mb-6 text-lg leading-relaxed">
              Designed to transform utility into art. Creating the next generation of scannable branding using the power of Gemini AI.
            </p>
            <p className="text-xs font-semibold text-brand-primary bg-brand-primary/10 inline-block px-3 py-1 rounded-full">Powered by Google Gemini AI</p>
          </div>
          
          <div>
            <h4 className="font-bold text-base-content mb-5 text-lg">Product</h4>
            <ul className="space-y-3 text-sm text-base-content-secondary">
              <li><button onClick={() => onNavigate('home')} className="hover:text-brand-primary transition-colors hover:translate-x-1 duration-200 inline-block">Generator</button></li>
              <li><button onClick={() => onNavigate('use-cases')} className="hover:text-brand-primary transition-colors hover:translate-x-1 duration-200 inline-block">Use Cases</button></li>
              <li>
                <button 
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => {
                      const gallerySection = document.getElementById('gallery');
                      if (gallerySection) {
                        gallerySection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }} 
                  className="hover:text-brand-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                >
                  Gallery
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base-content mb-5 text-lg">Company & Legal</h4>
            <ul className="space-y-3 text-sm text-base-content-secondary">
              <li><button onClick={() => onNavigate('about')} className="hover:text-brand-primary transition-colors hover:translate-x-1 duration-200 inline-block">About</button></li>
              <li><button onClick={() => onNavigate('blog')} className="hover:text-brand-primary transition-colors hover:translate-x-1 duration-200 inline-block">Blog</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-brand-primary transition-colors hover:translate-x-1 duration-200 inline-block">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-brand-primary transition-colors hover:translate-x-1 duration-200 inline-block">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-base-300/50 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-base-content-secondary">
          <p>&copy; {new Date().getFullYear()} QR Code Themer. All rights reserved.</p>
          <div className="flex gap-4">
             {/* Social placeholders could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
