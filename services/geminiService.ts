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
  customApiKey?: string | null,
  referenceImage?: { data: string; mimeType: MimeType }
): Promise<string[]> {
  const ai = getAiClient(customApiKey);
  
  // This is the core instruction for the image generation model.
  // It's a detailed "prompt" that tells the AI exactly what to do.
  const basePrompt = referenceImage 
  ? `
    You are a creative graphic designer specializing in QR codes.
    Your task is to artistically redesign the first provided image (the QR code) based on two sources of inspiration:
    1. THEME DESCRIPTION: "${theme}"
    2. REFERENCE IMAGE: The second image provided is a reference for the desired visual style, color palette, and mood. Draw inspiration from it.

    ${extraPrompt ? `ADDITIONAL INSTRUCTIONS: "${extraPrompt}"\n` : ''}

    **CRITICAL INSTRUCTIONS:**
    1.  **MAXIMIZE SCANABILITY THROUGH CONTRAST:** This is the most important rule. The final image MUST be a fully functional, scannable QR code. To achieve this, you MUST use high contrast between the dark and light modules of the QR code.
    2.  **PRESERVE DATA INTEGRITY:** The core data patterns of the QR code must be maintained.
    3.  **APPLY THEME CREATIVELY BUT SAFELY:** Infuse the QR code with the theme's style, but **only after** satisfying the high-contrast rule.
    4.  **DO NOT ADD TEXT:** The final output should be the image only.
  `
  : `
    You are a creative graphic designer specializing in QR codes.
    Your task is to artistically redesign the provided QR code image based on the following theme, derived from a website's branding:
    
    THEME: "${theme}"

    ${extraPrompt ? `ADDITIONAL INSTRUCTIONS: "${extraPrompt}"\n` : ''}

    **CRITICAL INSTRUCTIONS:**
    1.  **MAXIMIZE SCANABILITY THROUGH CONTRAST:** This is the most important rule. The final image MUST be a fully functional, scannable QR code. To achieve this, you MUST use high contrast between the dark and light modules of the QR code.
    2.  **PRESERVE DATA INTEGRITY:** The core data patterns of the QR code must be maintained.
    3.  **APPLY THEME CREATIVELY BUT SAFELY:** Infuse the QR code with the theme's style, but **only after** satisfying the high-contrast rule.
    4.  **DO NOT ADD TEXT:** The final output should be the image only.
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