import React, { useState, useCallback, useEffect } from 'react';
import { generateThemedQRCode, getWebsiteTheme } from './services/geminiService';
import { generateQRCodeFromURL, validateQRCode } from './utils/qrUtils';
import { AppState, MimeType, GenerationConfig, ValidationResult, BackgroundStyle, GradientConfig, PatternConfig } from './types';
import Header from './components/Header';
import URLInput from './components/URLInput';
import QRCodeUploader from './components/QRCodeUploader';
import GeneratedQRCode from './components/GeneratedQRCode';
import ImageCountSelector from './components/ImageCountSelector';
import ExtraPromptInput from './components/ExtraPromptInput';
import Sidebar from './components/Sidebar';
import AdBanner from './components/AdBanner';
import { Loader2, Wand2 } from 'lucide-react';
import { defaultGenerationConfig, defaultExtraPrompt, defaultExtraPrompt2, defaultGradientConfig, defaultPatternConfig } from './config/defaults';
import { hexToRgb } from './utils/colorUtils';
import { setCookie, getCookie } from './utils/cookieUtils';

const DAILY_LIMIT = 10;
const COOKIE_NAME = 'qrThemerDailyLimit';

const App: React.FC = () => {
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [extraPrompt, setExtraPrompt] = useState<string>(defaultExtraPrompt2);
  const [baseQrCode, setBaseQrCode] = useState<string | null>(null);
  
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(defaultGenerationConfig);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  
  // Daily limit state
  const [dailyGenerationsLeft, setDailyGenerationsLeft] = useState<number>(DAILY_LIMIT);
  
  // Theme state
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('default');
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>(defaultGradientConfig);
  const [patternConfig, setPatternConfig] = useState<PatternConfig>(defaultPatternConfig);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  // Effect to read the cookie on initial load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue) {
        try {
            const { count, lastReset } = JSON.parse(cookieValue);
            if (lastReset === today) {
                setDailyGenerationsLeft(count);
            } else {
                // It's a new day, reset the cookie
                setCookie(COOKIE_NAME, JSON.stringify({ count: DAILY_LIMIT, lastReset: today }), 1);
                setDailyGenerationsLeft(DAILY_LIMIT);
            }
        } catch (e) {
            // Invalid cookie, reset it
             setCookie(COOKIE_NAME, JSON.stringify({ count: DAILY_LIMIT, lastReset: today }), 1);
             setDailyGenerationsLeft(DAILY_LIMIT);
        }
    } else {
        // No cookie, user's first time or it expired
        setDailyGenerationsLeft(DAILY_LIMIT);
    }
  }, []);


  useEffect(() => {
    const bgElement = document.getElementById('body-bg');
    if (bgElement) {
      // Reset all properties
      bgElement.className = 'fixed inset-0 -z-10 transition-all duration-500';
      bgElement.style.backgroundImage = '';
      bgElement.style.backgroundColor = '';

      switch (backgroundStyle) {
        case 'gradient':
          const fromRgb = hexToRgb(gradientConfig.fromColor, 0.2);
          const viaRgb = hexToRgb(gradientConfig.viaColor, 1);
          const toRgb = hexToRgb(gradientConfig.toColor, 0.2);
          bgElement.style.backgroundImage = `linear-gradient(240deg, ${fromRgb}, ${viaRgb}, ${toRgb})`;
          if (gradientConfig.isAnimated) {
            bgElement.classList.add('animate-gradient-shift', 'bg-300%');
          }
          break;
        case 'pattern':
          const encodedColor = encodeURIComponent(patternConfig.color);
          const svgPattern = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath d='M0 0L4 4L8 0L4 0L0 0Z M0 8L4 4L8 8L4 8L0 8Z' fill='${encodedColor}' fill-opacity='${patternConfig.opacity}'%3e%3c/path%3e%3c/svg%3e")`;
          bgElement.style.backgroundImage = svgPattern;
          bgElement.style.backgroundColor = 'var(--color-base-200, #111827)';
          break;
        case 'image':
           if (customImageUrl) {
            bgElement.style.backgroundImage = `url(${customImageUrl})`;
            bgElement.classList.add('bg-cover', 'bg-center');
          }
          break;
        case 'default':
        default:
          bgElement.classList.add('bg-base-200');
          break;
      }
    }
  }, [backgroundStyle, gradientConfig, patternConfig, customImageUrl]);

  const handleReset = useCallback(() => {
    setGeneratedImages(null);
    setValidationResults([]);
    setAppState(AppState.IDLE);
    setErrorMessage('');
    setBaseQrCode(null);
  }, []);
  
  const handleResetToDefaults = useCallback(() => {
    setGenerationConfig(defaultGenerationConfig);
    setExtraPrompt(defaultExtraPrompt);
  }, []);

  const handleReferenceImageChange = (file: File | null) => {
    setReferenceImageFile(file);
    // Do not reset the entire generation here, only if URL changes.
  };

  const handleUrlChange = (url: string) => {
    setWebsiteUrl(url);
    handleReset();
  };
  
  const handleImageCountChange = (count: number) => {
    setNumberOfImages(count);
    // Only reset if images have already been generated
    if (generatedImages) {
        handleReset();
    }
  };

  const getBaseQRCode = useCallback(async (): Promise<{data: string, mimeType: MimeType}> => {
    if (websiteUrl) {
      if (baseQrCode) {
        return { data: baseQrCode, mimeType: 'image/png' };
      }
      setAppState(AppState.GENERATING_BASE_QR);
      const base64Data = await generateQRCodeFromURL(websiteUrl);
      setBaseQrCode(base64Data); // Cache the generated QR code
      return { data: base64Data, mimeType: 'image/png' };
    }
    throw new Error("No URL provided to generate QR code.");
  }, [websiteUrl, baseQrCode]);

  const validateAndSetImages = async (base64Images: string[]) => {
    setGeneratedImages(base64Images);
    setAppState(AppState.VALIDATING);
    const initialResults: ValidationResult[] = base64Images.map(() => ({ status: 'pending', data: null }));
    setValidationResults(initialResults);

    for (let i = 0; i < base64Images.length; i++) {
      const result = await validateQRCode(base64Images[i]);
      setValidationResults(prev => {
        const newResults = [...prev];
        newResults[i] = result;
        return newResults;
      });
    }
    setAppState(AppState.SUCCESS);
  };
  
  const getReferenceImage = useCallback(async (): Promise<{ data: string; mimeType: MimeType; } | undefined> => {
      if (!referenceImageFile) return undefined;
      
      const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(referenceImageFile);
      });
      return { data: base64EncodedData, mimeType: referenceImageFile.type as MimeType };
  }, [referenceImageFile]);


  const handleSubmit = useCallback(async () => {
    if (!websiteUrl) {
      setErrorMessage('Please enter a website URL.');
      return;
    }
    
    if (dailyGenerationsLeft <= 0) {
      setErrorMessage("You've reached your daily limit of 10 generations. Please try again tomorrow.");
      return;
    }

    handleReset();

    try {
      const today = new Date().toISOString().split('T')[0];
      const newCount = dailyGenerationsLeft - 1;
      setDailyGenerationsLeft(newCount);
      setCookie(COOKIE_NAME, JSON.stringify({ count: newCount, lastReset: today }), 1);
      
      const { data: qrCodeImageBase64, mimeType } = await getBaseQRCode();
      
      setAppState(AppState.LOADING_THEME);
      const themeDescription = await getWebsiteTheme(websiteUrl, customApiKey || null);
      
      const referenceImage = await getReferenceImage();

      setAppState(AppState.LOADING_QR_CODE);
      const newImageBase64Array = await generateThemedQRCode(
        themeDescription, 
        qrCodeImageBase64, 
        mimeType, 
        numberOfImages,
        generationConfig,
        extraPrompt,
        customApiKey || null,
        referenceImage
      );
      
      await validateAndSetImages(newImageBase64Array);

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(`Generation failed: ${errorMessage}`);
      setAppState(AppState.ERROR);
    }
  }, [websiteUrl, numberOfImages, generationConfig, extraPrompt, handleReset, customApiKey, getBaseQRCode, getReferenceImage, dailyGenerationsLeft]);

  const handleRegenerate = useCallback(async (indexToRegenerate: number) => {
    setErrorMessage('');
    try {
      const { data: qrCodeImageBase64, mimeType } = await getBaseQRCode();
      
      // Update state for just the one being regenerated
      setValidationResults(prev => {
        const newResults = [...prev];
        newResults[indexToRegenerate] = { status: 'pending', data: null };
        return newResults;
      });
      
      const themeDescription = await getWebsiteTheme(websiteUrl, customApiKey || null);
      const referenceImage = await getReferenceImage();
      
      const newImageBase64Array = await generateThemedQRCode(
        themeDescription, 
        qrCodeImageBase64, 
        mimeType, 
        1, // only generate one
        {...generationConfig, seed: Math.floor(Math.random() * 1000000)}, // use a new random seed
        extraPrompt,
        customApiKey || null,
        referenceImage
      );

      const newImageBase64 = newImageBase64Array[0];
      const validationResult = await validateQRCode(newImageBase64);

      // Update the specific image and its validation result
      setGeneratedImages(prev => {
        if (!prev) return null;
        const newImages = [...prev];
        newImages[indexToRegenerate] = newImageBase64;
        return newImages;
      });
      setValidationResults(prev => {
        const newResults = [...prev];
        newResults[indexToRegenerate] = validationResult;
        return newResults;
      });

    } catch (error) {
        console.error(error);
        setErrorMessage(`Regeneration failed for image ${indexToRegenerate + 1}.`);
    }
  }, [websiteUrl, generationConfig, extraPrompt, customApiKey, getBaseQRCode, getReferenceImage]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return url.length === 0; // Allow empty
    }
  };

  const isFormValid = websiteUrl.length > 0 && isValidUrl(websiteUrl);
  const isLoading = [
    AppState.GENERATING_BASE_QR,
    AppState.LOADING_THEME,
    AppState.LOADING_QR_CODE,
    AppState.VALIDATING
  ].includes(appState);

  return (
    <div className="min-h-screen bg-transparent text-base-content font-sans">
      <Header onSettingsClick={() => setIsSidebarOpen(true)} />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        config={generationConfig} 
        setConfig={setGenerationConfig} 
        onResetToDefaults={handleResetToDefaults}
        backgroundStyle={backgroundStyle}
        setBackgroundStyle={setBackgroundStyle}
        gradientConfig={gradientConfig}
        setGradientConfig={setGradientConfig}
        patternConfig={patternConfig}
        setPatternConfig={setPatternConfig}
        customImageUrl={customImageUrl}
        setCustomImageUrl={setCustomImageUrl}
        customApiKey={customApiKey}
        setCustomApiKey={setCustomApiKey}
      />

      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-base-100 rounded-2xl shadow-lg p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Input Column */}
            <div className="lg:col-span-2 flex flex-col space-y-6">
              
              <URLInput 
                value={websiteUrl} 
                onChange={handleUrlChange}
              />

              <QRCodeUploader onFileChange={handleReferenceImageChange} />

              <ImageCountSelector value={numberOfImages} onChange={handleImageCountChange} />

              <ExtraPromptInput value={extraPrompt} onChange={setExtraPrompt} />
              
              <div className="text-center -mt-2 px-2">
                <p className="text-sm font-semibold text-base-content">
                  Daily Generations Left: {dailyGenerationsLeft} / {DAILY_LIMIT}
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading || dailyGenerationsLeft <= 0}
                className="w-full flex items-center justify-center gap-3 text-lg font-semibold py-4 px-6 rounded-xl text-white transition-all duration-300 ease-in-out bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-6 w-6" />
                    <span>Generate Themed QR Code</span>
                  </>
                  
                )}
              </button>
              <p className="text-xs text-base-content-secondary text-center -mt-3 px-2">
                By generating, your prompt, URL, and images will be sent to the Gemini API for processing.
              </p>
              {errorMessage && <p className="text-red-400 text-center font-medium animate-fade-in mt-2">{errorMessage}</p>}
            </div>

            {/* Output Column */}
            <div className="lg:col-span-3 flex flex-col items-center justify-start min-h-[400px]">
              <GeneratedQRCode
                appState={appState}
                generatedImages={generatedImages}
                validationResults={validationResults}
                referenceImageFile={referenceImageFile}
                websiteUrl={websiteUrl}
                onRegenerate={handleRegenerate}
              />
              <AdBanner />
            </div>
          </div>
        </div>
        <footer className="text-center mt-8 text-base-content-secondary">
          <p>  Powered by Gemini</p>
        </footer>
      </main>
    </div>
  );
};

export default App;