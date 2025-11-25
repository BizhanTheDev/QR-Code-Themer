
import React from 'react';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { PageView } from '../../types';

const ContactPage: React.FC<{ onNavigate: (page: PageView) => void }> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-base-100/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-base-300 mb-12 text-center">
        <h1 className="text-4xl font-bold text-base-content mb-4">Get in Touch</h1>
        <p className="text-xl text-base-content-secondary max-w-2xl mx-auto">
          Have questions about generating QR codes or have a feature request? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-base-200 p-6 rounded-3xl border border-base-300 transition-all duration-300 hover:shadow-lg hover:border-brand-primary/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content mb-1">Email Us</h3>
                <p className="text-base-content-secondary text-sm mb-2">For general inquiries and support.</p>
                <a href="mailto:support@qrcodethemer.com" className="text-brand-primary font-semibold hover:underline">support@qrcodethemer.com</a>
              </div>
            </div>
          </div>

          <div className="bg-base-200 p-6 rounded-3xl border border-base-300 transition-all duration-300 hover:shadow-lg hover:border-brand-primary/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-secondary/10 rounded-2xl text-brand-secondary">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content mb-1">Social Media</h3>
                <p className="text-base-content-secondary text-sm mb-2">Follow us for design tips and updates.</p>
                <p className="text-base-content-secondary font-medium">@QRCodeThemer</p>
              </div>
            </div>
          </div>

          <div className="bg-base-200 p-6 rounded-3xl border border-base-300 transition-all duration-300 hover:shadow-lg hover:border-brand-primary/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content mb-1">Location</h3>
                <p className="text-base-content-secondary text-sm">
                  Digital First HQ<br />
                  San Francisco, CA<br />
                  United States
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-base-100/50 backdrop-blur-md p-8 rounded-3xl border border-base-300 shadow-xl">
          <h3 className="text-2xl font-bold text-base-content mb-6">Send a Message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-base-content-secondary mb-1">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-base-content-secondary mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-base-content-secondary mb-1">Message</label>
              <textarea 
                id="message" 
                rows={4}
                className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all resize-none"
                placeholder="How can we help?"
              ></textarea>
            </div>
            <button className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-secondary transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
