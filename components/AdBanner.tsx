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

  // This effect injects the AdSense script into the document head if it doesn't exist.
  useEffect(() => {
    if (!adClient || document.getElementById('adsense-script')) {
      return;
    }
    const script = document.createElement("script");
    script.id = "adsense-script";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [adClient]);

  // This effect runs after the component mounts to trigger an ad request.
  useEffect(() => {
    try {
      if (window.adsbygoogle && adClient && adSlot) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [adClient, adSlot]);

  // If the ad client or slot ID is not configured, render a placeholder.
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