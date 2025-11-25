
import React from 'react';
import { PageView } from '../../types';

const AboutPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
       <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-base-content mb-4">Our Mission</h1>
        <p className="text-xl text-base-content-secondary">Bridging the gap between utility and aesthetics.</p>
      </div>

      <div className="bg-base-200 rounded-2xl p-8 mb-12 border border-base-300">
        <h2 className="text-2xl font-bold text-base-content mb-4">The Vision</h2>
        <p className="text-base-content-secondary leading-relaxed mb-6">
          QR Code Themer was founded on a simple observation: beautiful designs were being compromised by generic, blocky QR codes. For too long, designers and businesses had to choose between functionality and visual cohesion.
        </p>
        <p className="text-base-content-secondary leading-relaxed mb-6">
           The digital landscape is evolving. With the advent of advanced generative AI models like Google's Gemini, it is now possible to blend error-correction algorithms with artistic expression.
        </p>
        <p className="text-base-content-secondary leading-relaxed">
          Our goal is to democratize this technology. We provide a platform where anyone—regardless of design experience—can generate scannable, branded assets that elevate their marketing materials rather than detracting from them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 bg-base-100/50 rounded-xl border border-base-300">
            <h3 className="text-xl font-bold text-base-content mb-3">Accessibility Commitment</h3>
            <p className="text-base-content-secondary text-sm leading-relaxed">
                We believe powerful design tools should be accessible to everyone. The platform offers a generous daily free tier for casual users. For high-volume enterprise needs, we offer the flexibility to integrate custom API keys, ensuring scalability without prohibitive costs.
            </p>
        </div>
        <div className="p-6 bg-base-100/50 rounded-xl border border-base-300">
            <h3 className="text-xl font-bold text-base-content mb-3">Privacy First Architecture</h3>
            <p className="text-base-content-secondary text-sm leading-relaxed">
                Data privacy is central to our architecture. Generation history is stored locally within the user's browser via Local Storage, rather than on centralized servers. This ensures that user data remains in their control and is not sold to third parties.
            </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-base-content-secondary italic mb-6">
            "Design is not just what it looks like and feels like. Design is how it works."
        </p>
        <button onClick={() => onNavigate('home')} className="text-brand-primary font-bold hover:underline">
            Back to Generator
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
