
import React from 'react';
import { PageView } from '../../types';

export const PrivacyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-base-content-secondary">
    <h1 className="text-3xl font-bold text-base-content mb-8">Privacy Policy</h1>
    <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
    
    <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">1. Introduction</h2>
        <p>Welcome to QR Code Themer. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
    </section>

    <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">2. Data We Collect</h2>
        <p>We collect minimal data necessary to provide our service:</p>
        <ul className="list-disc pl-5">
            <li><strong>Usage Data:</strong> Information about how you use our website.</li>
            <li><strong>Input Data:</strong> The URLs and prompts you enter to generate images. Note that images are generated via Google Gemini API.</li>
        </ul>
    </section>

    <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">3. How We Use Your Data</h2>
        <p>We use your data to:</p>
        <ul className="list-disc pl-5">
            <li>Provide and maintain the Service.</li>
            <li>Monitor the usage of the Service.</li>
            <li>Detect, prevent and address technical issues.</li>
        </ul>
    </section>

     <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">4. Third-Party Services</h2>
        <p>We use third-party services for specific functionality:</p>
        <ul className="list-disc pl-5">
            <li><strong>Google Gemini API:</strong> Used for image generation.</li>
            <li><strong>Google AdSense:</strong> Used to display advertisements. AdSense may use cookies to serve ads based on your prior visits.</li>
        </ul>
    </section>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-base-content-secondary">
    <h1 className="text-3xl font-bold text-base-content mb-8">Terms of Service</h1>
     <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

    <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">1. Agreement to Terms</h2>
        <p>By accessing our website, you agree to be bound by these Terms of Service and agree that you are responsible for the agreement with any applicable local laws.</p>
    </section>

    <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials on QR Code Themer's website for personal, non-commercial transitory viewing only.</p>
        <p>You may not use the generated QR codes for illegal or malicious purposes, including but not limited to phishing, malware distribution, or deceptive practices.</p>
    </section>

    <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">3. Disclaimer</h2>
        <p>The materials on QR Code Themer's website are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.</p>
    </section>
    
    <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-base-content">4. API Usage</h2>
        <p>Our service utilizes the Google Gemini API. By using our service, you acknowledge that generation availability depends on the status and limits of the third-party API provider.</p>
    </section>
  </div>
);
