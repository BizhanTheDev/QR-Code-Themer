import React, { useState, useCallback, useEffect } from 'react';
import { generateThemedQRCode, getWebsiteTheme } from './services/geminiService';
import { generateQRCodeFromURL, validateQRCode } from './utils/qrUtils';
import { AppState, MimeType, GenerationConfig, ValidationResult, BackgroundStyle, GradientConfig, PatternConfig, HistoryItem, QRShape } from './types';
import Header from './components/Header';
import URLInput from './components/URLInput';
import QRCodeUploader from './components/QRCodeUploader';
import GeneratedQRCode from './components/GeneratedQRCode';
import ImageCountSelector from './components/ImageCountSelector';
import ExtraPromptInput from './components/ExtraPromptInput';
import Sidebar from './components/Sidebar';
import AdBanner from './components/AdBanner';
import Toast from './components/Toast';
import Lightbox from './components/Lightbox';
import { Loader2, Wand2, Zap, Sparkles, Smartphone, AlertTriangle, Infinity as InfinityIcon, ShieldAlert } from 'lucide-react';
import { defaultGenerationConfig, defaultGradientConfig, defaultPatternConfig } from './config/defaults';
import { hexToRgb } from './utils/colorUtils';
import { setCookie, getCookie } from './utils/cookieUtils';
import { useTaskQueue } from './hooks/useTaskQueue';
import { getHistory, saveGenerationToHistory, clearHistory } from './utils/historyUtils';

const DAILY_LIMIT = 20;
const LOW_CREDIT_THRESHOLD = 8;
const COOKIE_NAME = 'qrThemerDailyLimit';

type ToastMessage = { id: number; message: string; type: 'warning' | 'info' } | null;

const App: React.FC = () => {
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [shape, setShape] = useState<QRShape>('squares');
  const [extraPrompt, setExtraPrompt] = useState<string>('');
  const [baseQrCode, setBaseQrCode] = useState<string | null>(null);
  
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(defaultGenerationConfig);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  
  const { tasks, addTask, isProcessing } = useTaskQueue();
  
  // New creative controls state
  const [readability, setReadability] = useState(0.5);
  const [styleStrength, setStyleStrength] = useState(0.5);
  const [creativity, setCreativity] = useState(defaultGenerationConfig.temperature);

  // Daily limit state
  const [dailyGenerationsLeft, setDailyGenerationsLeft] = useState<number>(DAILY_LIMIT);
  
  // Custom Key Limits
  const [userDefinedLimit, setUserDefinedLimit] = useState<number | null>(null);
  const [sessionGenerationCount, setSessionGenerationCount] = useState<number>(0);
  
  // Theme state
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('gradient');
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>(defaultGradientConfig);
  const [patternConfig, setPatternConfig] = useState<PatternConfig>(defaultPatternConfig);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [isGlassTheme, setIsGlassTheme] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Toast notification state
  const [toast, setToast] = useState<ToastMessage>(null);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // State to track if it's the first generation vs a regeneration for animation purposes
  const [isInitialGeneration, setIsInitialGeneration] = useState(true);

  // Effect to load history and daily limit cookie on initial load
  useEffect(() => {
    setHistory(getHistory());
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue) {
        try {
            const { count, lastReset } = JSON.parse(cookieValue);
            if (lastReset === today) {
                setDailyGenerationsLeft(count);
            } else {
                setCookie(COOKIE_NAME, JSON.stringify({ count: DAILY_LIMIT, lastReset: today }), 1);
                setDailyGenerationsLeft(DAILY_LIMIT);
            }
        } catch (e) {
             setCookie(COOKIE_NAME, JSON.stringify({ count: DAILY_LIMIT, lastReset: today }), 1);
             setDailyGenerationsLeft(DAILY_LIMIT);
        }
    } else {
        setDailyGenerationsLeft(DAILY_LIMIT);
    }
  }, []);


  useEffect(() => {
    const bgElement = document.getElementById('body-bg');
    if (bgElement) {
      // Cleanup from previous state
      bgElement.className = 'fixed inset-0 -z-10 transition-all duration-500';
      bgElement.style.backgroundImage = '';
      bgElement.style.backgroundColor = '';
      bgElement.style.filter = '';
      bgElement.innerHTML = '';

      switch (backgroundStyle) {
        case 'gradient':
          const fromRgb = hexToRgb(gradientConfig.fromColor, 0.6);
          const viaRgb = hexToRgb(gradientConfig.viaColor, 1);
          const toRgb = hexToRgb(gradientConfig.toColor, 0.6);
          bgElement.style.backgroundImage = `linear-gradient(240deg, ${fromRgb}, ${viaRgb}, ${toRgb})`;
          if (gradientConfig.isAnimated) {
            bgElement.classList.add('animate-gradient-shift', 'bg-300%');
          }
          break;
        case 'pattern': {
            if (shape === 'fluid') {
                const { fromColor, viaColor, toColor } = gradientConfig;
                const { size, fluidComplexity, fluidSpeed, fluidBlur } = patternConfig;
                
                bgElement.style.backgroundColor = 'var(--color-base-200, #111827)';
                bgElement.style.filter = 'contrast(25)';

                const fluidContainer = document.createElement('div');
                fluidContainer.className = `absolute inset-0`;
                if (fluidBlur) {
                    fluidContainer.classList.add('filter', 'blur-[40px]');
                }

                const blobColors = [
                    `linear-gradient(135deg, ${hexToRgb(fromColor)}, ${hexToRgb(viaColor)})`,
                    `linear-gradient(135deg, ${hexToRgb(viaColor)}, ${hexToRgb(toColor)})`,
                    `linear-gradient(135deg, ${hexToRgb(toColor)}, ${hexToRgb(fromColor)})`,
                ];

                let blobsHtml = '';
                for (let i = 0; i < fluidComplexity; i++) {
                    const blobSize = (size + Math.random() * 20 - 10);
                    const animationName = `animate-lava-${(i % 4) + 1}`;
                    const animationDuration = (120 - fluidSpeed) * (0.8 + Math.random() * 0.4);
                    const top = `${Math.random() * 80}vh`;
                    const left = `${Math.random() * 80}vw`;
                    const color = blobColors[i % blobColors.length];

                    blobsHtml += `<div class="absolute w-[${blobSize}vmax] h-[${blobSize}vmax] rounded-full ${animationName}" style="background: ${color}; animation-duration: ${animationDuration}s; top: ${top}; left: ${left};"></div>`;
                }

                fluidContainer.innerHTML = blobsHtml;
                bgElement.innerHTML = ''; // Clear previous content
                bgElement.appendChild(fluidContainer);
            } else {
                const encodedColor = encodeURIComponent(patternConfig.color);
                const size = patternConfig.size || 10;

                const svgContent: { [key in Exclude<QRShape, 'fluid'>]: string } = {
                    squares: `<path d='M0 0h5v5H0z M5 5h5v5H5z' fill='${encodedColor}' fill-opacity='${patternConfig.opacity}'/>`,
                    circles: `<circle cx='5' cy='5' r='2' fill='${encodedColor}' fill-opacity='${patternConfig.opacity}'/>`,
                    diamonds: `<path d='M0 0L4 4L8 0L4 0L0 0Z M0 8L4 4L8 8L4 8L0 8Z' fill='${encodedColor}' fill-opacity='${patternConfig.opacity}'/>`,
                };
                
                const viewBoxes: { [key in Exclude<QRShape, 'fluid'>]: string } = {
                    squares: '0 0 10 10',
                    circles: '0 0 10 10',
                    diamonds: '0 0 8 8',
                };
                
                const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='${viewBoxes[shape]}'>${svgContent[shape]}</svg>`;
                const svgPattern = `url("data:image/svg+xml,${encodeURIComponent(svgString)}")`;
                
                bgElement.style.backgroundImage = svgPattern;
                bgElement.style.backgroundColor = 'var(--color-base-200, #111827)';
            }
            break;
        }
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
  }, [backgroundStyle, gradientConfig, patternConfig, customImageUrl, shape]);

  const handleReset = useCallback(() => {
    setGeneratedImages(null);
    setValidationResults([]);
    setAppState(AppState.IDLE);
    setErrorMessage('');
    setBaseQrCode(null);
    setProgress(0);
  }, []);
  
  const handleResetToDefaults = useCallback(() => {
    setGenerationConfig(defaultGenerationConfig);
    setCreativity(defaultGenerationConfig.temperature);
    setExtraPrompt('');
  }, []);

  const handleReferenceImageChange = (file: File | null) => {
    setReferenceImageFile(file);
  };

  const handleUrlChange = (url: string) => {
    setWebsiteUrl(url);
    handleReset();
  };
  
  const handleImageCountChange = (count: number) => {
    setNumberOfImages(count);
    if (generatedImages) {
        handleReset();
    }
  };
  
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const showToast = (message: string, type: 'warning' | 'info' = 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  const getBaseQRCode = useCallback(async (): Promise<{data: string, mimeType: MimeType}> => {
    if (websiteUrl) {
      if (baseQrCode) {
        return { data: baseQrCode, mimeType: 'image/png' };
      }
      setAppState(AppState.GENERATING_BASE_QR);
      setProgress(0.1);
      const base64Data = await generateQRCodeFromURL(websiteUrl);
      setBaseQrCode(base64Data);
      return { data: base64Data, mimeType: 'image/png' };
    }
    throw new Error("No URL provided to generate QR code.");
  }, [websiteUrl, baseQrCode]);

  const validateAndSetImages = async (base64Images: string[]) => {
    setGeneratedImages(base64Images);
    setAppState(AppState.VALIDATING);
    setProgress(0.85);
    const initialResults: ValidationResult[] = base64Images.map(() => ({ status: 'pending', data: null }));
    setValidationResults(initialResults);

    await Promise.all(base64Images.map(async (img, i) => {
      const result = await validateQRCode(img);
      setValidationResults(prev => {
        const newResults = [...prev];
        newResults[i] = result;
        return newResults;
      });
    }));
    
    // Save to history on successful generation
    const newHistoryItem: HistoryItem = {
      id: `${Date.now()}`,
      images: base64Images,
      url: websiteUrl,
      extraPrompt: extraPrompt,
      timestamp: Date.now(),
    };
    saveGenerationToHistory(newHistoryItem);
    setHistory(prev => [newHistoryItem, ...prev]);

    setAppState(AppState.SUCCESS);
    setProgress(1);
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


  const handleSubmit = useCallback(() => {
    if (!websiteUrl) {
      setErrorMessage('Please enter a website URL.');
      return;
    }
    
    const isUsingCustomKey = !!customApiKey;

    // Check Limits based on Key usage
    if (isUsingCustomKey) {
        // Logic for custom key: Check user defined safety limit
        if (userDefinedLimit !== null) {
            if (sessionGenerationCount + numberOfImages > userDefinedLimit) {
                showToast(`Session limit reached (${userDefinedLimit}). Adjust settings in API tab.`, 'warning');
                return;
            }
        }
    } else {
        // Logic for default key: Check daily limit
        if (dailyGenerationsLeft < numberOfImages) {
            showToast(`You only have ${dailyGenerationsLeft} generations left.`, 'warning');
            return;
        }
        if (dailyGenerationsLeft <= LOW_CREDIT_THRESHOLD) {
            showToast(`You are running low on credits (${dailyGenerationsLeft} left).`, 'info');
        }
    }

    addTask(async () => {
      handleReset();
      setIsInitialGeneration(true); // Set flag for initial generation animation
      try {
        // Update limits
        if (isUsingCustomKey) {
             setSessionGenerationCount(prev => prev + numberOfImages);
        } else {
            const today = new Date().toISOString().split('T')[0];
            const newCount = dailyGenerationsLeft - numberOfImages;
            setDailyGenerationsLeft(newCount);
            setCookie(COOKIE_NAME, JSON.stringify({ count: newCount, lastReset: today }), 1);
        }
        
        const { data: qrCodeImageBase64, mimeType } = await getBaseQRCode();
        
        setAppState(AppState.LOADING_THEME);
        setProgress(0.3);
        const themeDescription = await getWebsiteTheme(websiteUrl, customApiKey || null);
        
        const referenceImage = await getReferenceImage();

        setAppState(AppState.LOADING_QR_CODE);
        setProgress(0.6);
        const newImageBase64Array = await generateThemedQRCode(
          themeDescription, 
          qrCodeImageBase64, 
          mimeType, 
          numberOfImages,
          { ...generationConfig, temperature: creativity },
          extraPrompt,
          readability,
          styleStrength,
          customApiKey || null,
          referenceImage
        );
        
        await validateAndSetImages(newImageBase64Array);

      } catch (error) {
        console.error(error);
        const errMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setErrorMessage(`Generation failed: ${errMessage}`);
        setAppState(AppState.ERROR);
        setProgress(0);
      }
    });
  }, [websiteUrl, numberOfImages, generationConfig, extraPrompt, handleReset, customApiKey, getBaseQRCode, getReferenceImage, dailyGenerationsLeft, readability, styleStrength, creativity, addTask, userDefinedLimit, sessionGenerationCount]);

  const handleRegenerate = useCallback((indexToRegenerate: number) => {
    const isUsingCustomKey = !!customApiKey;

    if (isUsingCustomKey) {
         if (userDefinedLimit !== null && sessionGenerationCount + 1 > userDefinedLimit) {
            showToast(`Session limit reached (${userDefinedLimit}).`, 'warning');
            return;
        }
    } else {
        if (dailyGenerationsLeft < 1) {
            showToast("You've reached your daily limit for today.", 'warning');
            return;
        }
    }
    
    addTask(async () => {
      setErrorMessage('');
      setIsInitialGeneration(false); // Set flag to prevent all cards from animating
      try {
        if (isUsingCustomKey) {
             setSessionGenerationCount(prev => prev + 1);
        } else {
            const today = new Date().toISOString().split('T')[0];
            const newCount = dailyGenerationsLeft - 1;
            setDailyGenerationsLeft(newCount);
            setCookie(COOKIE_NAME, JSON.stringify({ count: newCount, lastReset: today }), 1);
        }

        const { data: qrCodeImageBase64, mimeType } = await getBaseQRCode();
        
        setValidationResults(prev => {
          const newResults = [...prev];
          newResults[indexToRegenerate] = { status: 'pending', data: null };
          return newResults;
        });
        
        const themeDescription = await getWebsiteTheme(websiteUrl, customApiKey || null);
        const referenceImage = await getReferenceImage();
        
        // Note: For regeneration, we only request 1 image from the API
        const newImageBase64Array = await generateThemedQRCode(
          themeDescription, 
          qrCodeImageBase64, 
          mimeType, 
          1,
          {...generationConfig, seed: Math.floor(Math.random() * 1000000), temperature: creativity },
          extraPrompt,
          readability,
          styleStrength,
          customApiKey || null,
          referenceImage
        );

        const newImageBase64 = newImageBase64Array[0];
        const validationResult = await validateQRCode(newImageBase64);

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
    });
  }, [websiteUrl, generationConfig, extraPrompt, customApiKey, getBaseQRCode, getReferenceImage, readability, styleStrength, creativity, dailyGenerationsLeft, addTask, userDefinedLimit, sessionGenerationCount]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return url.length === 0;
    }
  };

  const isFormValid = websiteUrl.length > 0 && isValidUrl(websiteUrl);
  const isLoading = isProcessing || [
    AppState.GENERATING_BASE_QR,
    AppState.LOADING_THEME,
    AppState.LOADING_QR_CODE,
    AppState.VALIDATING
  ].includes(appState);

  return (
    <div className="min-h-screen bg-transparent text-base-content font-sans">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      {lightboxImage && <Lightbox imageSrc={lightboxImage} onClose={() => setLightboxImage(null)} />}
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
        readability={readability}
        setReadability={setReadability}
        styleStrength={styleStrength}
        setStyleStrength={setStyleStrength}
        creativity={creativity}
        setCreativity={setCreativity}
        history={history}
        onClearHistory={handleClearHistory}
        onImageClick={setLightboxImage}
        shape={shape}
        setShape={setShape}
        isGlassTheme={isGlassTheme}
        setIsGlassTheme={setIsGlassTheme}
        userDefinedLimit={userDefinedLimit}
        setUserDefinedLimit={setUserDefinedLimit}
      />

      <main className="container mx-auto p-4 md:p-8">
        <div className={`max-w-7xl mx-auto rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in-up transition-all duration-300 ${isGlassTheme ? 'bg-base-100/50 backdrop-blur-lg border border-white/10' : 'bg-base-100'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Input Column */}
            <div className="lg:col-span-2 flex flex-col space-y-4 lg:space-y-6">
              
              <URLInput 
                value={websiteUrl} 
                onChange={handleUrlChange}
              />

              <QRCodeUploader onFileChange={handleReferenceImageChange} />

              <ImageCountSelector value={numberOfImages} onChange={handleImageCountChange} />

              <ExtraPromptInput value={extraPrompt} onChange={setExtraPrompt} />
              
              {/* Status / Credits Area */}
              <div className="text-center -mt-2 px-2 transition-all duration-300">
                {customApiKey ? (
                     <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-2 text-yellow-500 font-bold text-sm">
                            <ShieldAlert className="w-4 h-4" />
                            USING CUSTOM API KEY
                        </div>
                        <p className="text-xs text-yellow-500/80 mt-1">
                            Generations are using your personal API quota.
                        </p>
                         {userDefinedLimit !== null && (
                             <p className="text-xs font-mono text-base-content-secondary mt-1 border-t border-yellow-500/20 pt-1">
                                 Session Limit: {sessionGenerationCount} / {userDefinedLimit}
                             </p>
                         )}
                     </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                         <p className={`text-sm font-semibold flex items-center gap-2 ${dailyGenerationsLeft <= LOW_CREDIT_THRESHOLD ? 'text-red-400 animate-pulse' : 'text-base-content'}`}>
                          {dailyGenerationsLeft <= LOW_CREDIT_THRESHOLD && <AlertTriangle className="w-4 h-4" />}
                          Daily Generations Left: {dailyGenerationsLeft} / {DAILY_LIMIT}
                        </p>
                        {dailyGenerationsLeft === 0 && (
                            <p className="text-xs text-red-400">Limit reached. Add your own API key in Settings for infinite generations.</p>
                        )}
                    </div>
                )}
               
                 {isProcessing && tasks.length > 0 && (
                    <p className="text-xs text-brand-secondary animate-pulse mt-2">
                        {tasks.length} task(s) in queue...
                    </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading || (!customApiKey && dailyGenerationsLeft < numberOfImages) || (customApiKey && userDefinedLimit !== null && sessionGenerationCount + numberOfImages > userDefinedLimit)}
                className="w-full flex items-center justify-center gap-3 text-lg font-semibold py-4 px-6 rounded-xl text-white transition-all duration-300 ease-out-quad bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6" />
                    <span>Processing...</span>
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
            <div className="lg:col-span-3 flex flex-col items-center justify-start min-h-[300px] sm:min-h-[400px]">
              <GeneratedQRCode
                appState={appState}
                generatedImages={generatedImages}
                validationResults={validationResults}
                referenceImageFile={referenceImageFile}
                websiteUrl={websiteUrl}
                extraPrompt={extraPrompt}
                onRegenerate={handleRegenerate}
                isProcessing={isProcessing}
                progress={progress}
                isInitialGeneration={isInitialGeneration}
                onImageClick={setLightboxImage}
              />
              <AdBanner />
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="max-w-7xl mx-auto mt-12 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <div className="p-6 rounded-xl bg-base-100/80 backdrop-blur-md border border-white/5 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center md:justify-start gap-3 text-brand-primary mb-3">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-base-content">Instant AI Generation</h3>
                </div>
                <p className="text-sm text-base-content-secondary leading-relaxed text-center md:text-left">
                    Don't settle for boring black and white squares. Our AI analyzes your website's visual identity and generates custom QR codes that perfectly match your brand.
                </p>
            </div>
            
            <div className="p-6 rounded-xl bg-base-100/80 backdrop-blur-md border border-white/5 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center md:justify-start gap-3 text-brand-secondary mb-3">
                     <div className="p-2 bg-brand-secondary/10 rounded-lg">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-base-content">Artistic & Scannable</h3>
                </div>
                <p className="text-sm text-base-content-secondary leading-relaxed text-center md:text-left">
                    Blending art with technology. We use advanced Gemini AI models to ensure your QR codes are stunningly artistic while remaining 100% scannable by any smartphone.
                </p>
            </div>
            
            <div className="p-6 rounded-xl bg-base-100/80 backdrop-blur-md border border-white/5 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center md:justify-start gap-3 text-blue-400 mb-3">
                    <div className="p-2 bg-blue-400/10 rounded-lg">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-base-content">Marketing Ready</h3>
                </div>
                <p className="text-sm text-base-content-secondary leading-relaxed text-center md:text-left">
                    Perfect for digital marketing, business cards, and flyers. Create a lasting impression with a QR code that tells your brand's story at a glance.
                </p>
            </div>
        </div>

        <footer className="text-center py-8 text-base-content-secondary border-t border-base-300/50 mt-8">
          <p className="font-medium">QR Code Themer &copy; {new Date().getFullYear()}</p>
          <p className="text-xs mt-2 opacity-70">Powered by Google Gemini AI</p>
        </footer>
      </main>
    </div>
  );
};

export default App;