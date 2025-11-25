
import React from 'react';
import { Palette, Coffee, ShoppingBag, Zap } from 'lucide-react';

const Gallery: React.FC = () => {
  // Since we don't have real static images to serve, we create styled placeholders 
  // that represent what the tool creates.
  const examples = [
    {
      title: "Neon Cyberpunk",
      desc: "High contrast, glowing edges, perfect for tech events.",
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      color: "bg-gray-900",
      accent: "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
    },
    {
      title: "Artisan Coffee",
      desc: "Warm tones, liquid textures, ideal for cafe menus.",
      icon: <Coffee className="w-12 h-12 text-amber-700" />,
      color: "bg-amber-50",
      accent: "border-amber-600"
    },
    {
      title: "Modern Retail",
      desc: "Clean, minimalist, integrated logo styles.",
      icon: <ShoppingBag className="w-12 h-12 text-purple-500" />,
      color: "bg-white",
      accent: "border-purple-500"
    },
    {
      title: "Abstract Art",
      desc: "Fluid shapes and vibrant gradients.",
      icon: <Palette className="w-12 h-12 text-pink-500" />,
      color: "bg-gray-100",
      accent: "border-pink-500"
    }
  ];

  return (
    <section className="py-16 bg-base-100/50 backdrop-blur-xl rounded-3xl border border-white/5 my-16 shadow-2xl" id="gallery">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-base-content mb-4 tracking-tight">Gallery of Possibilities</h2>
        <p className="text-base-content-secondary max-w-2xl mx-auto px-4 text-lg">
          See what's possible when you combine standard QR codes with our generative AI engine. 
          From subtle branding to full artistic transformations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-8">
        {examples.map((ex, i) => (
          <div key={i} className="group relative aspect-square rounded-3xl bg-base-200 overflow-hidden border-2 border-base-300 hover:border-brand-primary transition-all duration-500 flex flex-col items-center justify-center p-6 text-center hover:-translate-y-3 hover:shadow-2xl hover:shadow-brand-primary/20">
            <div className={`w-24 h-24 rounded-2xl mb-6 flex items-center justify-center border-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${ex.color} ${ex.accent}`}>
                {ex.icon}
            </div>
            <h3 className="font-bold text-xl text-base-content mb-2">{ex.title}</h3>
            <p className="text-sm text-base-content-secondary leading-relaxed">{ex.desc}</p>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <p className="text-sm italic text-base-content-secondary bg-base-200/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          *Actual results vary based on your prompt and settings.
        </p>
      </div>
    </section>
  );
};

export default Gallery;
