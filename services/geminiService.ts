import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationConfig, MimeType } from '../types';

// This check ensures that the API key is available. 
// In a real-world application, this key should be kept secret and managed securely.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// Initialize the Google Gemini AI client with the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a website's visual theme using the Gemini model.
 *
 * @param {string} url The URL of the website to analyze.
 * @returns {Promise<string>} A promise that resolves to a text description of the website's theme.
 */
export async function getWebsiteTheme(url: string): Promise<string> {
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
 * @returns {Promise<string[]>} A promise that resolves to an array of base64-encoded image strings.
 */
export async function generateThemedQRCode(
  theme: string, 
  qrCodeImageBase64: string, 
  mimeType: MimeType, 
  numberOfImages: number,
  generationConfig: GenerationConfig,
  extraPrompt: string
): Promise<string[]> {
  // This is the core instruction for the image generation model.
  // It's a detailed "prompt" that tells the AI exactly what to do.
  const basePrompt = `
    You are a creative graphic designer specializing in QR codes.
    Your task is to artistically redesign the provided QR code image based on the following theme, derived from a website's branding:
    
    THEME: "${theme}"

    ${extraPrompt ? `ADDITIONAL INSTRUCTIONS: "${extraPrompt}"\n` : ''}

    **CRITICAL INSTRUCTIONS:**
    1.  **MAXIMIZE SCANABILITY THROUGH CONTRAST:** This is the most important rule. The final image MUST be a fully functional, scannable QR code. To achieve this, you MUST use high contrast between the dark and light modules of the QR code.
        - The dark squares of the QR code should be rendered in a very dark color, ideally black or a near-black shade from the theme.
        - The light areas (the background of the code) must be a very light color, ideally white or a very light shade from the theme.
        - **Avoid low-contrast color combinations** (e.g., yellow on white, gray on light gray). If the theme has a dark background, the QR code's light areas must still be a light color to contrast with the dark modules.
    2.  **PRESERVE DATA INTEGRITY:** The core data patterns (the black and white squares, including the larger finder patterns) must be maintained in their exact positions and shapes. Do not distort them.
    3.  **APPLY THEME CREATIVELY BUT SAFELY:** Infuse the QR code with the theme's colors, style, and mood, but **only after** satisfying the high-contrast rule. You can apply artistic elements to the background *around* the code, or use themed colors for the dark modules, but the contrast must remain high. A good test is to squint at the image; the QR code pattern should still be instantly and clearly visible.
    4.  **DO NOT ADD TEXT:** The final output should be the image only. No explanatory text.
    5.  **HIGH QUALITY:** The output should be a clean, high-resolution image.
  `;

  // Create an array of promises, one for each image generation request.
  // This allows us to run the requests in parallel, which is faster than doing them one by one.
  const generationPromises = Array.from({ length: numberOfImages }, (_, i) => {
    // For multiple images, we slightly tweak the prompt to encourage different results.
    const uniquePrompt = numberOfImages > 1 
      ? `${basePrompt}\n\n**VARIATION:** Create variation number ${i + 1} of ${numberOfImages}. Please provide a distinct visual interpretation of the theme.`
      : basePrompt;

    // We use the 'gemini-2.5-flash-image' model, which can understand both text and images.
    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      // The 'contents' part includes the inputs for the model.
      contents: {
        parts: [
          // Part 1: The original QR code image.
          {
            inlineData: {
              data: qrCodeImageBase64,
              mimeType: mimeType,
            },
          },
          // Part 2: Our detailed text prompt.
          {
            text: uniquePrompt,
          },
        ],
      },
      // The 'config' tells the model we expect an image as the output.
      config: {
        responseModalities: [Modality.IMAGE],
        ...generationConfig,
      },
    });
  });

  try {
    // `Promise.all` waits for all the individual image generation promises to complete.
    const responses = await Promise.all(generationPromises);

    // Once all responses are back, we process them to extract the image data.
    const imageB64Strings = responses.map(response => {
      // The image data is located in the 'parts' array of the first candidate.
      const firstPart = response.candidates?.[0]?.content?.parts?.[0];
      if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
        // We return the base64 encoded image data.
        return firstPart.inlineData.data;
      } else {
        // If an image is missing from a response, we throw an error for that specific one.
        throw new Error('No image data returned from the API for one of the requests.');
      }
    });

    return imageB64Strings;

  } catch (error) {
    console.error("Error generating themed QR code:", error);
    throw new Error("Could not generate the themed QR code. Please try again.");
  }
}