import React, { useEffect } from 'react';

// Extend the Window interface to include the adsbygoogle property
declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

const AdBanner: React.FC = () => {
  const adClient = process.env.VITE_ADSENSE_CLIENT_ID;
  const adSlot = process.env.VITE_ADSENSE_SLOT_ID;

  useEffect(() => {
    // This effect will run after the component mounts
    // and is the recommended way to trigger an ad request.
    try {
      if (window.adsbygoogle && adClient && adSlot) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [adClient, adSlot]);

  // If the ad client or slot ID is not configured, don't render anything.
  // This prevents broken ad blocks from showing up in development and provides
  // a helpful message.
  if (!adClient || !adSlot) {
    return (
        <div className="w-full text-center bg-base-300/50 p-4 rounded-lg mt-6 animate-fade-in">
            <p className="text-sm font-semibold text-base-content">Advertisement</p>
            <p className="text-xs text-base-content-secondary mt-1">Ad placeholder: AdSense environment variables are not configured.</p>
        </div>
    );
  }

  return (
    <div className="w-full text-center mt-6" key={adSlot}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;