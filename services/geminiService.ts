import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationConfig, MimeType } from '../types';

/**
 * Initializes and returns a GoogleGenAI client.
 * Prioritizes a custom API key if provided, otherwise falls back to the environment variable.
 * Throws an error if no API key is available.
 * @param {string | null} [customApiKey] - An optional user-provided API key.
 * @returns {GoogleGenAI} An instance of the GoogleGenAI client.
 */
const getAiClient = (customApiKey?: string | null): GoogleGenAI => {
  const apiKey = customApiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured. Add your key in Advanced Settings or ensure the site's key is set.");
  }
  return new GoogleGenAI({ apiKey });
};


/**
 * Analyzes a website's visual theme using the Gemini model.
 *
 * @param {string} url The URL of the website to analyze.
 * @param {string | null} [customApiKey] - An optional user-provided API key.
 * @returns {Promise<string>} A promise that resolves to a text description of the website's theme.
 */
export async function getWebsiteTheme(url: string, customApiKey?: string | null): Promise<string> {
  const ai = getAiClient(customApiKey);
  // This prompt instructs the AI to act as a designer and describe the website's branding.
  // It asks for specific details like color palette, style, and overall feeling.
  const prompt = `
    Analyze the branding and visual identity of the website at the URL: ${url}.
    Based on its likely design, describe its visual theme in a concise paragraph. 
    Focus on:
    - Color Palette (mention 3-4 key colors)
    - Overall Style (e.g., minimalist, corporate, playful, futuristic, retro, artistic)
    - Key visual elements or feelings it evokes (e.g., professionalism, creativity, nature, technology).
    This description will be used to inspire an artistic QR code design.
  `;
  
  try {
    // Send the prompt to the 'gemini-2.5-flash' model, which is good for fast text-based tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // The 'response.text' property directly contains the generated text from the model.
    return response.text;
  } catch (error) {
    console.error("Error getting website theme:", error);
    // Throw a more user-friendly error to be caught by the UI.
    throw new Error("Could not analyze website theme. The model may be unavailable.");
  }
}


/**
 * Generates one or more themed QR codes based on a theme description and an original QR code image.
 *
 * @param {string} theme A text description of the visual theme to apply.
 * @param {string} qrCodeImageBase64 The original QR code image, encoded in base64.
 * @param {MimeType} mimeType The MIME type of the original QR code image (e.g., 'image/png').
 * @param {number} numberOfImages The number of QR code variations to generate.
 * @param {GenerationConfig} generationConfig Advanced generation settings.
 * @param {string} extraPrompt Additional user instructions.
 * @param {number} readability A value from 0-1 controlling the QR code's scannability vs. artistic freedom.
 * @param {number} styleStrength A value from 0-1 controlling how strongly the theme is applied.
 * @param {string | null} [customApiKey] - An optional user-provided API key.
 * @param {{ data: string; mimeType: MimeType; } | undefined} [referenceImage] - An optional reference image for styling.
 * @returns {Promise<string[]>} A promise that resolves to an array of base64-encoded image strings.
 */
export async function generateThemedQRCode(
  theme: string, 
  qrCodeImageBase64: string, 
  mimeType: MimeType, 
  numberOfImages: number,
  generationConfig: GenerationConfig,
  extraPrompt: string,
  readability: number,
  styleStrength: number,
  customApiKey?: string | null,
  referenceImage?: { data: string; mimeType: MimeType }
): Promise<string[]> {
  const ai = getAiClient(customApiKey);
  
  // Map slider values to descriptive terms for the prompt.
  const readabilityMap = {
    high: 'Must have extreme contrast and rigidly preserve the QR code structure.',
    medium: 'Should have high contrast and clearly preserve the QR code structure, allowing for some subtle integration.',
    low: 'Can have more abstract and integrated styling, as long as the core QR code data modules are logically distinguishable.'
  };

  const styleStrengthMap = {
    high: 'The design should be fully immersive and highly artistic, deeply integrating the theme. The QR code should feel like a piece of art.',
    medium: 'The theme should be clearly visible and stylistically integrated into the QR code, balancing art with function.',
    low: 'Apply only a subtle hint of the theme, focusing primarily on the basic QR code structure with minor thematic elements.'
  };

  const readabilityInstruction = readability > 0.66 ? readabilityMap.high : (readability > 0.33 ? readabilityMap.medium : readabilityMap.low);
  const styleStrengthInstruction = styleStrength > 0.66 ? styleStrengthMap.high : (styleStrength > 0.33 ? styleStrengthMap.medium : styleStrengthMap.low);

  const basePrompt = `
    You are a creative graphic designer specializing in QR codes.
    Your task is to artistically redesign the provided QR code image based on a theme.

    **Theme Inspiration:**
    ${referenceImage ? `The primary inspiration is the provided reference image. Also consider the theme description: "${theme}".` : `The theme is: "${theme}".`}

    **Creative Controls:**
    - **Readability:** ${readabilityInstruction} This is the most critical rule. The final image MUST be a scannable QR code.
    - **Style Strength:** ${styleStrengthInstruction}
    
    ${extraPrompt ? `**User Instructions:** "${extraPrompt}"\n` : ''}

    **Technical Rules:**
    1.  Preserve the QR code's data integrity and quiet zone.
    2.  Do not add any text unless it's part of the artistic design.
    3.  Output the image only.
  `;


  const generationPromises = Array.from({ length: numberOfImages }, (_, i) => {
    const uniquePrompt = numberOfImages > 1 
      ? `${basePrompt}\n\n**VARIATION:** Create variation number ${i + 1} of ${numberOfImages}. Please provide a distinct visual interpretation.`
      : basePrompt;

    const parts: any[] = [
      { inlineData: { data: qrCodeImageBase64, mimeType: mimeType } }, // The base QR code
    ];
    
    if (referenceImage) {
      parts.push({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
    }
    
    parts.push({ text: uniquePrompt });

    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
        ...generationConfig,
      },
    });
  });

  try {
    const responses = await Promise.all(generationPromises);

    const imageB64Strings = responses.map(response => {
      const firstPart = response.candidates?.[0]?.content?.parts?.[0];
      if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
      } else {
        throw new Error('No image data returned from the API for one of the requests.');
      }
    });

    return imageB64Strings;

  } catch (error) {
    console.error("Error generating themed QR code:", error);
    throw new Error("Could not generate the themed QR code. Please try again.");
  }
}