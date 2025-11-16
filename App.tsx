import React, { useState, useCallback, useEffect } from 'react';
import { generateThemedQRCode, getWebsiteTheme } from './services/geminiService';
import { generateQRCodeFromURL, validateQRCode } from './utils/qrUtils';
import { AppState, MimeType, QRSource, GenerationConfig, ValidationResult, BackgroundStyle, GradientConfig, PatternConfig } from './types';
import Header from './components/Header';
import URLInput from './components/URLInput';
import QRCodeUploader from './components/QRCodeUploader';
import GeneratedQRCode from './components/GeneratedQRCode';
import ImageCountSelector from './components/ImageCountSelector';
import SourceSelector from './components/SourceSelector';
import ExtraPromptInput from './components/ExtraPromptInput';
import Sidebar from './components/Sidebar';
import AdBanner from './components/AdBanner';
import { Loader2, Wand2 } from 'lucide-react';
import { defaultGenerationConfig, defaultExtraPrompt, defaultExtraPrompt2, defaultGradientConfig, defaultPatternConfig } from './config/defaults';
import { hexToRgb } from './utils/colorUtils';

const App: React.FC = () => {
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [extraPrompt, setExtraPrompt] = useState<string>(defaultExtraPrompt2);
  const [qrSource, setQrSource] = useState<QRSource>('upload');
  const [baseQrCode, setBaseQrCode] = useState<string | null>(null);
  
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(defaultGenerationConfig);
  
  // Theme state
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('default');
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>(defaultGradientConfig);
  const [patternConfig, setPatternConfig] = useState<PatternConfig>(defaultPatternConfig);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);


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

  const handleFileChange = (file: File | null) => {
    setQrCodeFile(file);
    handleReset();
  };

  const handleUrlChange = (url: string) => {
    setWebsiteUrl(url);
    handleReset();
  };
  
  const handleImageCountChange = (count: number) => {
    setNumberOfImages(count);
    handleReset();
  };

  const handleSourceChange = (source: QRSource) => {
    setQrSource(source);
    setQrCodeFile(null); // Reset file input when switching
    handleReset();
  };

  const getBaseQRCode = async (): Promise<{data: string, mimeType: MimeType}> => {
    if (qrSource === 'upload' && qrCodeFile) {
      const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(qrCodeFile);
      });
      return { data: base64EncodedData, mimeType: qrCodeFile.type as MimeType };
    } else if (qrSource === 'generate' && websiteUrl) {
      if (baseQrCode) {
        return { data: baseQrCode, mimeType: 'image/png' };
      }
      setAppState(AppState.GENERATING_BASE_QR);
      const base64Data = await generateQRCodeFromURL(websiteUrl);
      setBaseQrCode(base64Data); // Cache the generated QR code
      return { data: base64Data, mimeType: 'image/png' };
    }
    throw new Error("No valid QR code source found.");
  };

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

  const handleSubmit = useCallback(async () => {
    if (!websiteUrl) {
      setErrorMessage('Please enter a website URL.');
      return;
    }
    if (qrSource === 'upload' && !qrCodeFile) {
        setErrorMessage('Please upload a QR code image.');
        return;
    }

    handleReset();

    try {
      const { data: qrCodeImageBase64, mimeType } = await getBaseQRCode();
      
      setAppState(AppState.LOADING_THEME);
      const themeDescription = await getWebsiteTheme(websiteUrl);

      setAppState(AppState.LOADING_QR_CODE);
      const newImageBase64Array = await generateThemedQRCode(
        themeDescription, 
        qrCodeImageBase64, 
        mimeType, 
        numberOfImages,
        generationConfig,
        extraPrompt
      );
      
      await validateAndSetImages(newImageBase64Array);

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(`Generation failed: ${errorMessage}`);
      setAppState(AppState.ERROR);
    }
  }, [qrCodeFile, websiteUrl, numberOfImages, qrSource, generationConfig, extraPrompt, handleReset]);

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
      
      const themeDescription = await getWebsiteTheme(websiteUrl);
      const newImageBase64Array = await generateThemedQRCode(
        themeDescription, 
        qrCodeImageBase64, 
        mimeType, 
        1, // only generate one
        {...generationConfig, seed: Math.floor(Math.random() * 1000000)}, // use a new random seed
        extraPrompt
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
  }, [websiteUrl, qrSource, qrCodeFile, generationConfig, extraPrompt]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return url.length === 0; // Allow empty
    }
  };

  const isFormValid = (qrSource === 'upload' ? qrCodeFile !== null : true) && websiteUrl.length > 0 && isValidUrl(websiteUrl);
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
      />

      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-base-100 rounded-2xl shadow-lg p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Input Column */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="mb-6">
                <SourceSelector source={qrSource} setSource={handleSourceChange} />
              </div>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${qrSource === 'upload' ? 'max-h-[320px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                <QRCodeUploader onFileChange={handleFileChange} />
              </div>

              <div className="mb-6">
                <URLInput 
                  value={websiteUrl} 
                  onChange={handleUrlChange}
                  source={qrSource}
                />
              </div>

              <div className="mb-6">
                <ImageCountSelector value={numberOfImages} onChange={handleImageCountChange} source={qrSource} />
              </div>

              <div className="mb-6">
                <ExtraPromptInput value={extraPrompt} onChange={setExtraPrompt} source={qrSource} />
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className="w-full flex items-center justify-center gap-3 text-lg font-semibold py-4 px-6 rounded-xl text-white transition-all duration-300 ease-in-out bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none mt-2"
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
              <p className="text-xs text-base-content-secondary text-center mt-3 px-2">
                By generating, your prompt, URL, and QR image will be sent to the Gemini API for processing.
              </p>
              {errorMessage && <p className="text-red-400 text-center font-medium animate-fade-in mt-4">{errorMessage}</p>}
            </div>

            {/* Output Column */}
            <div className="lg:col-span-3 flex flex-col items-center justify-start min-h-[400px]">
              <GeneratedQRCode
                appState={appState}
                generatedImages={generatedImages}
                validationResults={validationResults}
                originalQRCodeFile={qrCodeFile}
                websiteUrl={websiteUrl}
                onRegenerate={handleRegenerate}
              />
              {/* <AdBanner /> */}
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
