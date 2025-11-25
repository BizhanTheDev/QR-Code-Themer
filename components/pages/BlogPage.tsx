
import React from 'react';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { PageView } from '../../types';

const BlogPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-2 text-brand-primary font-bold mb-8 hover:underline bg-base-100/80 px-4 py-2 rounded-full shadow-sm border border-base-300 backdrop-blur-sm transition-transform hover:-translate-x-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Generator
      </button>

      <div className="grid gap-12">
        {/* Article 1 */}
        <div className="bg-base-100/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl border border-base-300 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-4 text-xs text-base-content-secondary mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Oct 24, 2024</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 5 min read</span>
                <span className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md font-bold">Design</span>
            </div>
            <article className="prose prose-invert lg:prose-xl max-w-none">
                <h1 className="text-4xl font-bold text-base-content mb-6">Styled QR Codes: Why Ugly Squares are Out</h1>
                
                <p className="text-xl text-base-content-secondary mb-8">
                Let's be honest: standard QR codes are ugly. They look like robot barf. But in 2024, they don't have to be.
                </p>

                <div className="bg-base-200 p-6 rounded-2xl border-l-4 border-brand-primary mb-8">
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
            </article>
        </div>

        {/* Article 2 */}
        <div className="bg-base-100/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl border border-base-300 transition-all hover:shadow-2xl">
             <div className="flex items-center gap-4 text-xs text-base-content-secondary mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Nov 02, 2024</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 4 min read</span>
                <span className="bg-brand-secondary/10 text-brand-secondary px-2 py-1 rounded-md font-bold">Marketing</span>
            </div>
             <article className="prose prose-invert lg:prose-xl max-w-none">
                <h1 className="text-4xl font-bold text-base-content mb-6">The Future of Physical Links</h1>
                
                <p className="text-xl text-base-content-secondary mb-8">
                    We live in a hybrid world. The gap between the physical object in your hand and the digital content on your screen is shrinking.
                </p>

                <h2 className="text-2xl font-bold text-base-content mt-8 mb-4">Why functionality isn't enough</h2>
                <p className="text-base-content-secondary mb-4">
                    For a decade, the QR code was strictly utilitarian. It was a black and white jagged square that screamed "I am a computer thing." Designers hated them. They put them on the back of packaging, in the corners of posters, hiding them away like a shameful secret.
                </p>
                <p className="text-base-content-secondary mb-4">
                    But utility without aesthetics is bad design. If you want a user to interact with a digital touchpoint, it needs to be inviting. It needs to promise value.
                </p>

                <h2 className="text-2xl font-bold text-base-content mt-8 mb-4">AI as the Bridge</h2>
                <p className="text-base-content-secondary mb-4">
                    Generative AI models, like the ones powering QR Code Themer, act as a translator. They take the rigid, mathematical language of the QR code (the data modules) and translate it into the visual language of humans (art, pattern, color).
                </p>
                <p className="text-base-content-secondary mb-4">
                    This isn't just about making things "pretty." It's about coherence. When a QR code looks like the product it links to, it creates a subconscious connection in the user's mind. It reduces visual friction.
                </p>

                 <h2 className="text-2xl font-bold text-base-content mt-8 mb-4">Trust through Quality</h2>
                <p className="text-base-content-secondary mb-4">
                    There is also a trust factor. A generic, pixelated QR code can lead anywhere. It feels spammy. A custom-designed, branded code signals effort. It signals that a human being cared about this touchpoint.
                </p>
                <p className="text-base-content-secondary mb-4">
                    In an era where digital trust is low, high-quality design is one of the few signals of legitimacy we have left. Don't waste it on a default setting.
                </p>
            </article>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button onClick={() => onNavigate('home')} className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-secondary transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-primary/25">
            Create Your Own Design
        </button>
      </div>
    </div>
  );
};

export default BlogPage;
