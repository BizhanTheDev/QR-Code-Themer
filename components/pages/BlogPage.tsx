
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageView } from '../../types';

const BlogPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-2 text-brand-primary font-bold mb-6 hover:underline bg-base-100/80 px-4 py-2 rounded-lg shadow-sm border border-base-300 backdrop-blur-sm transition-transform hover:-translate-x-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Generator
      </button>

      <div className="bg-base-100/90 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl border border-base-300">
        <article className="prose prose-invert lg:prose-xl max-w-none">
            <h1 className="text-4xl font-bold text-base-content mb-6">Styled QR Codes: Why Ugly Squares are Out</h1>
            
            <p className="text-xl text-base-content-secondary mb-8">
            Let's be honest: standard QR codes are ugly. They look like robot barf. But in 2024, they don't have to be.
            </p>

            <div className="bg-base-200 p-6 rounded-xl border-l-4 border-brand-primary mb-8">
            <h3 className="text-xl font-bold text-base-content mb-2">The Short Version</h3>
            <ul className="list-disc ml-5 space-y-2 text-base-content-secondary">
                <li>People are more likely to scan something that looks interesting.</li>
                <li>AI can now hide the code *inside* art.</li>
                <li>It makes your brand look premium instead of cheap.</li>
            </ul>
            </div>

            <h2 className="text-2xl font-bold text-base-content mt-8 mb-4">What is a "Styled" QR Code?</h2>
            <p className="text-base-content-secondary mb-4">
            A styled QR code uses a loophole in how QR scanners work. Scanners only need about 30% of the pixels to be perfect to read the link (it's called error correction).
            </p>
            <p className="text-base-content-secondary mb-4">
            That means we have 70% of the image to play with. Our AI turns that noisy pixel mess into flowers, neon signs, logos, or coffee beans, while keeping just enough "anchors" for your phone camera to recognize it.
            </p>

            <h2 className="text-2xl font-bold text-base-content mt-8 mb-4">5 Ways to Use Them (That Aren't Boring)</h2>
            
            <h3 className="text-xl font-semibold text-base-content mt-6 mb-2">1. The "Vibe" Menu</h3>
            <p className="text-base-content-secondary mb-4">
            If you run a nice cafe, don't slap a sticker on the table. Make a QR code that looks like latte art. It fits the mood and makes people actually want to pull out their phone.
            </p>

            <h3 className="text-xl font-semibold text-base-content mt-6 mb-2">2. Real Estate Curb Appeal</h3>
            <p className="text-base-content-secondary mb-4">
            Imagine a "For Sale" sign where the QR code looks like a sketch of the house itself. It's subtle, it's cool, and it makes potential buyers curious.
            </p>

            <h3 className="text-xl font-semibold text-base-content mt-6 mb-2">3. Unboxing Experience</h3>
            <p className="text-base-content-secondary mb-4">
            Packaging is expensive. Don't ruin it. If you're selling organic soap, make the QR code look like leaves or bubbles. Link it to a video of how the soap is made.
            </p>

            <h3 className="text-xl font-semibold text-base-content mt-6 mb-2">4. Wedding Invites</h3>
            <p className="text-base-content-secondary mb-4">
            RSVP cards are annoying to mail back. A QR code is easier, but usually ugly. We can blend the code into the floral design of your invite so it doesn't stand out until you look closely.
            </p>

            <h3 className="text-xl font-semibold text-base-content mt-6 mb-2">5. The "Who is this guy?" Card</h3>
            <p className="text-base-content-secondary mb-4">
            Business cards end up in the trash. A card with a really unique, artistic code gets passed around. "Whoa, check this out." That's the reaction you want.
            </p>

            <h2 className="text-2xl font-bold text-base-content mt-8 mb-4">Wrap Up</h2>
            <p className="text-base-content-secondary mb-8">
            The era of ugly QR codes is over. You have tools (like this one) to make them look good for free. Give it a shot.
            </p>

            <div className="mt-12 pt-8 border-t border-base-300 text-center">
                <button onClick={() => onNavigate('home')} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all transform hover:scale-105">
                    Make One Now
                </button>
            </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPage;
