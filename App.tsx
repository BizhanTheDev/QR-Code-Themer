
import React, { useState, useCallback, useEffect } from 'react';
import { generateThemedQRCode, getWebsiteTheme } from './services/geminiService';
import { generateQRCodeFromURL, validateQRCode } from './utils/qrUtils';
import { AppState, MimeType, GenerationConfig, ValidationResult, BackgroundStyle, GradientConfig, PatternConfig, HistoryItem, QRShape, PageView } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import URLInput from './components/URLInput';
import QRCodeUploader from './components/QRCodeUploader';
import GeneratedQRCode from './components/GeneratedQRCode';
import ImageCountSelector from './components/ImageCountSelector';
import ExtraPromptInput from './components/ExtraPromptInput';
import Sidebar from './components/Sidebar';
import AdBanner from './components/AdBanner';
import Toast from './components/Toast';
import Lightbox from './components/Lightbox';
import Gallery from './components/Gallery';
import BlogPage from './components/pages/BlogPage';
import AboutPage from './components/pages/AboutPage';
import UseCasesPage from './components/pages/UseCasesPage';
import ContactPage from './components/pages/ContactPage';
import { PrivacyPage, TermsPage } from './components/pages/LegalPages';
import { Loader2, Wand2, Zap, Sparkles, Smartphone, AlertTriangle, ShieldAlert, CheckCircle2, Search, Palette, Download } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState<PageView>('home');
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

  // Handle URL hash changes for routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['home', 'about', 'blog', 'use-cases', 'privacy', 'terms', 'contact'].includes(hash)) {
        setCurrentPage(hash as PageView);
      } else {
        setCurrentPage('home');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update page title based on navigation
  useEffect(() => {
    const baseTitle = "QR Code Themer | Free AI Generator";
    const titles: Record<string, string> = {
        'home': baseTitle,
        'about': "About Us | QR Code Themer",
        'blog': "Blog & Insights | QR Code Themer",
        'use-cases': "Use Cases | QR Code Themer",
        'contact': "Contact Us | QR Code Themer",
        'privacy': "Privacy Policy | QR Code Themer",
        'terms': "Terms of Service | QR Code Themer",
    };
    document.title = titles[currentPage] || baseTitle;
  }, [currentPage]);

  // Update hash when page changes via state
  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        
        setAppState(AppState.LOADING_THEME);
        const themeDescription = await getWebsiteTheme(websiteUrl, customApiKey || null);
        const referenceImage = await getReferenceImage();

        setAppState(AppState.LOADING_QR_CODE);
        const newImages = await generateThemedQRCode(
          themeDescription, 
          qrCodeImageBase64, 
          mimeType, 
          1, // Regenerate only 1
          { ...generationConfig, temperature: creativity },
          extraPrompt,
          readability,
          styleStrength,
          customApiKey || null,
          referenceImage
        );
        
        if (generatedImages) {
            const updatedImages = [...generatedImages];
            updatedImages[indexToRegenerate] = newImages[0];
            setGeneratedImages(updatedImages);
            
            setAppState(AppState.VALIDATING);
            setValidationResults(prev => {
                const newRes = [...prev];
                newRes[indexToRegenerate] = { status: 'pending', data: null };
                return newRes;
            });

            const result = await validateQRCode(newImages[0]);
            setValidationResults(prev => {
                const newRes = [...prev];
                newRes[indexToRegenerate] = result;
                return newRes;
            });
            
            setHistory(prev => {
                const newHist = [...prev];
                if (newHist.length > 0 && newHist[0].url === websiteUrl) {
                    newHist[0].images = updatedImages;
                    saveGenerationToHistory(newHist[0]);
                }
                return newHist;
            });
            
            setAppState(AppState.SUCCESS);
        }

      } catch (error) {
        console.error(error);
        const errMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(`Regeneration failed: ${errMessage}`, 'warning');
        setAppState(AppState.SUCCESS);
      }
    });
  }, [websiteUrl, generatedImages, generationConfig, extraPrompt, customApiKey, getBaseQRCode, getReferenceImage, dailyGenerationsLeft, readability, styleStrength, creativity, addTask, userDefinedLimit, sessionGenerationCount]);

  return (
    <div className={`min-h-screen flex flex-col font-sans text-base-content selection:bg-brand-primary selection:text-white ${isGlassTheme ? 'glass-theme' : ''}`}>
      {isGlassTheme && (
        <div className="fixed inset-0 pointer-events-none z-[-5] bg-base-200/30 backdrop-blur-md"></div>
      )}
      
      <Header 
        onSettingsClick={() => setIsSidebarOpen(true)} 
        currentPage={currentPage}
        onNavigate={navigateTo}
      />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentPage === 'home' && (
          <div className="animate-fade-in">
            {/* Top Generator Section */}
            <div className="flex flex-col lg:flex-row gap-8 mb-16">
              {/* Left Column: Controls */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className={`bg-base-100 p-6 rounded-3xl shadow-xl border border-base-300 space-y-8 transition-transform hover:shadow-2xl hover:scale-[1.01] duration-500 ${isGlassTheme ? 'bg-base-100/90 backdrop-blur-xl border-white/20' : ''}`}>
                  <URLInput value={websiteUrl} onChange={handleUrlChange} />
                  <QRCodeUploader onFileChange={handleReferenceImageChange} />
                  <ImageCountSelector value={numberOfImages} onChange={handleImageCountChange} />
                  <ExtraPromptInput value={extraPrompt} onChange={setExtraPrompt} />
                  
                  <div className="pt-4">
                      <button
                      onClick={handleSubmit}
                      disabled={isProcessing || !websiteUrl}
                      className="group relative w-full py-4 px-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-brand-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                      >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative flex items-center justify-center gap-2">
                          {isProcessing ? (
                          <>
                              <Loader2 className="animate-spin h-6 w-6" />
                              Processing...
                          </>
                          ) : (
                          <>
                              <Wand2 className="h-6 w-6" />
                              Generate QR Code
                          </>
                          )}
                      </span>
                      </button>
                      
                      {!customApiKey && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-base-content-secondary">
                            <div className={`h-2 w-2 rounded-full ${dailyGenerationsLeft > LOW_CREDIT_THRESHOLD ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                            <span>
                                {dailyGenerationsLeft > 0 
                                ? `${dailyGenerationsLeft} free daily generations remaining` 
                                : 'Daily limit reached. Add API Key in Settings.'}
                            </span>
                        </div>
                      )}
                      {customApiKey && (
                         <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-400">
                             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span>Custom API Key Active (Unlimited)</span>
                         </div>
                      )}
                  </div>
                </div>
                
                {/* Mobile Ad Placeholder */}
                <div className="block lg:hidden">
                    <AdBanner />
                </div>
              </div>

              {/* Right Column: Preview/Results */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6 h-full min-h-[500px]">
                <div className={`flex-grow bg-base-100 rounded-3xl shadow-xl border border-base-300 p-4 lg:p-8 flex flex-col relative overflow-hidden transition-all duration-500 ${isGlassTheme ? 'bg-base-100/90 backdrop-blur-xl border-white/20' : ''}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
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
                    {errorMessage && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center animate-fade-in">
                        {errorMessage}
                    </div>
                    )}
                </div>
                
                 {/* Desktop Ad Placeholder */}
                 <div className="hidden lg:block">
                    <AdBanner />
                </div>
              </div>
            </div>

            {/* Gallery Section */}
            <Gallery />

            {/* SEO Content Section: Features */}
            <section className="mb-20">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-base-content mb-3 tracking-tight">Why Use This Tool?</h2>
                    <p className="text-lg text-base-content-secondary max-w-2xl mx-auto">
                        Stop using boring black-and-white squares. Create QR codes that actually fit your brand's vibe.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-base-100/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-base-300 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group">
                        <div className="w-14 h-14 bg-brand-primary/20 text-brand-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors group-hover:rotate-6">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-base-content mb-3">Designed by AI</h3>
                        <p className="text-base-content-secondary text-lg leading-relaxed">
                            Our advanced AI engine analyzes your website's colors and vibe, then designs a QR code that feels like it belongs there.
                        </p>
                    </div>
                    <div className="bg-base-100/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-base-300 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group">
                        <div className="w-14 h-14 bg-brand-secondary/20 text-brand-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-secondary group-hover:text-white transition-colors group-hover:-rotate-6">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-base-content mb-3">They Actually Work</h3>
                        <p className="text-base-content-secondary text-lg leading-relaxed">
                            Built with robust error-correction algorithms, we ensure your customers can actually use the code you print, blending art with utility.
                        </p>
                    </div>
                    <div className="bg-base-100/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-base-300 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group">
                         <div className="w-14 h-14 bg-pink-500/20 text-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors group-hover:rotate-6">
                            <Smartphone className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-base-content mb-3">Ready for Print</h3>
                        <p className="text-base-content-secondary text-lg leading-relaxed">
                            Get high-quality images ready for your flyers, business cards, or menus. No watermarks, just clean design.
                        </p>
                    </div>
                </div>
            </section>

             {/* SEO Content Section: How it Works */}
            <section className="mb-20">
                <div className="bg-base-200/50 rounded-3xl p-8 md:p-12 border border-base-300">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-base-content mb-4">How It Works</h2>
                        <p className="text-base-content-secondary max-w-2xl mx-auto">
                            We combine traditional QR code technology with state-of-the-art generative AI to create something entirely new.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center relative">
                            <div className="w-12 h-12 bg-base-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-primary border-2 border-brand-primary mx-auto mb-4 shadow-lg z-10 relative">1</div>
                            <h3 className="font-bold text-lg mb-2">Input URL</h3>
                            <p className="text-sm text-base-content-secondary">Enter the destination URL. We generate a high-error-correction base QR code.</p>
                            <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-base-300 -z-0"></div>
                        </div>
                        <div className="text-center relative">
                            <div className="w-12 h-12 bg-base-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-primary border-2 border-brand-primary mx-auto mb-4 shadow-lg z-10 relative">2</div>
                            <h3 className="font-bold text-lg mb-2">Analyze Theme</h3>
                            <p className="text-sm text-base-content-secondary">Our AI scans your website to understand your brand's color palette and visual style.</p>
                            <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-base-300 -z-0"></div>
                        </div>
                         <div className="text-center relative">
                            <div className="w-12 h-12 bg-base-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-primary border-2 border-brand-primary mx-auto mb-4 shadow-lg z-10 relative">3</div>
                            <h3 className="font-bold text-lg mb-2">Generate Art</h3>
                            <p className="text-sm text-base-content-secondary">Stable Diffusion models hallucinate a design that matches your brand while keeping the code structure.</p>
                            <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-base-300 -z-0"></div>
                        </div>
                         <div className="text-center relative">
                            <div className="w-12 h-12 bg-base-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-primary border-2 border-brand-primary mx-auto mb-4 shadow-lg z-10 relative">4</div>
                            <h3 className="font-bold text-lg mb-2">Validate</h3>
                            <p className="text-sm text-base-content-secondary">We run a simulated scan on the result. If it doesn't scan, we warn you immediately.</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* SEO Content Section: FAQ */}
             <section className="mb-16">
                 <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-base-content mb-4">Frequently Asked Questions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="bg-base-100/80 backdrop-blur-md p-6 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                             <CheckCircle2 className="w-5 h-5 text-green-500" />
                             Is this really free?
                        </h3>
                        <p className="text-base-content-secondary text-sm">
                            Yes! You get 20 free generations every single day. We don't watermark the images, so you can use them commercially instantly.
                        </p>
                    </div>
                    <div className="bg-base-100/80 backdrop-blur-md p-6 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                             <Search className="w-5 h-5 text-blue-500" />
                             Will these scan on all phones?
                        </h3>
                        <p className="text-base-content-secondary text-sm">
                            We use high-level error correction (Level H). Most modern iPhone and Android cameras scan them easily. We recommend testing them before printing thousands of copies.
                        </p>
                    </div>
                    <div className="bg-base-100/80 backdrop-blur-md p-6 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                             <Palette className="w-5 h-5 text-purple-500" />
                             Can I use my own logo?
                        </h3>
                        <p className="text-base-content-secondary text-sm">
                            Yes. Upload your logo in the "Reference Image" section. The AI will attempt to weave your logo's shape and colors into the QR code pattern.
                        </p>
                    </div>
                     <div className="bg-base-100/80 backdrop-blur-md p-6 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                             <Download className="w-5 h-5 text-orange-500" />
                             Do the codes expire?
                        </h3>
                        <p className="text-base-content-secondary text-sm">
                            No. These are static QR codes. They contain the direct link you provided. As long as your website is online, the code will work forever.
                        </p>
                    </div>
                </div>
             </section>
          </div>
        )}

        {currentPage === 'blog' && <BlogPage onNavigate={navigateTo} />}
        {currentPage === 'about' && <AboutPage onNavigate={navigateTo} />}
        {currentPage === 'use-cases' && <UseCasesPage onNavigate={navigateTo} />}
        {currentPage === 'contact' && <ContactPage onNavigate={navigateTo} />}
        {currentPage === 'privacy' && <PrivacyPage />}
        {currentPage === 'terms' && <TermsPage />}

      </main>

      <Footer onNavigate={navigateTo} />

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
      
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      
      {lightboxImage && (
        <Lightbox imageSrc={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
};

export default App;
