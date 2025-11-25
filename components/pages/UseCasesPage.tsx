
import React from 'react';
import { PageView } from '../../types';
import { ShoppingBag, Coffee, Ticket, Briefcase } from 'lucide-react';

const UseCasesPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const cases = [
    {
        title: "Retail & Packaging",
        icon: <ShoppingBag className="w-8 h-8 text-pink-500" />,
        desc: "Turn your product packaging into a digital gateway. Integrate a QR code that looks like your logo or product pattern. Link to instruction manuals, sustainability stories, or reorder pages."
    },
    {
        title: "Hospitality & Dining",
        icon: <Coffee className="w-8 h-8 text-amber-500" />,
        desc: "Ditch the laminate menus. Create a QR code that blends into your table aesthetic—wood grain textures for steakhouses, minimalist lines for sushi bars, or vibrant colors for taco spots."
    },
    {
        title: "Events & Ticketing",
        icon: <Ticket className="w-8 h-8 text-purple-500" />,
        desc: "Make the ticket part of the memory. Event organizers can use styled codes on wristbands or digital passes that reflect the theme of the concert, festival, or conference."
    },
    {
        title: "Corporate Branding",
        icon: <Briefcase className="w-8 h-8 text-blue-500" />,
        desc: "Stand out at the conference. Business cards are often discarded, but a unique, artistic QR code sparks curiosity. Link directly to your LinkedIn or portfolio in style."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-base-content mb-4">Use Cases</h1>
            <p className="text-xl text-base-content-secondary max-w-2xl mx-auto">
                Discover how styled QR codes are transforming industries by turning utility into engagement.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {cases.map((c, i) => (
                <div key={i} className="flex gap-6 p-8 bg-base-200 rounded-2xl border border-base-300 hover:border-brand-primary transition-colors">
                    <div className="flex-shrink-0 p-4 bg-base-100 rounded-xl h-fit">
                        {c.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-base-content mb-3">{c.title}</h3>
                        <p className="text-base-content-secondary leading-relaxed">{c.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-3xl p-12 text-center border border-brand-primary/30">
            <h2 className="text-3xl font-bold text-base-content mb-4">Ready to elevate your brand?</h2>
            <p className="text-base-content-secondary mb-8 max-w-lg mx-auto">
                Join thousands of creators who are making the internet a more beautiful place, one scan at a time.
            </p>
            <button onClick={() => onNavigate('home')} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg hover:shadow-brand-primary/50">
                Start Generating for Free
            </button>
        </div>
    </div>
  );
};

export default UseCasesPage;
