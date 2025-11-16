import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { ValidationResult } from '../types';

/**
 * Generates a QR code from a URL and returns it as a base64 encoded PNG.
 * @param url The URL to encode.
 * @returns A promise that resolves with the base64 string of the QR code image.
 */
export async function generateQRCodeFromURL(url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H', // High error correction for better scannability in artistic QRs
      margin: 1,
      width: 512,
    });
    return dataUrl.split(',')[1]; // Return only the base64 part
  } catch (err) {
    console.error('Failed to generate QR code', err);
    throw new Error('Could not generate QR code from the provided URL.');
  }
}

/**
 * Validates a QR code image from a base64 string using a two-step process.
 * @param base64Image The base64 string of the image to validate.
 * @returns A promise that resolves with a ValidationResult object.
 */
export function validateQRCode(base64Image: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64Image}`;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      // Add `willReadFrequently` for performance optimization
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return resolve({ status: 'invalid', data: null });
      }
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      
      // --- First Attempt: Scan the original, colored image ---
      let code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        return resolve({ status: 'valid', data: code.data });
      }

      // --- Second Attempt: If the first fails, apply a high-contrast filter ---
      // This helps with QR codes that have creative colors but good underlying structure.
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Simple luminance calculation
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Apply a threshold to force pixels to be either black or white
        const color = avg < 128 ? 0 : 255;
        data[i] = color;     // Red
        data[i + 1] = color; // Green
        data[i + 2] = color; // Blue
        // Alpha channel remains the same
      }
      
      // Re-scan with the processed, high-contrast image data
      code = jsQR(data, imageData.width, imageData.height);

      if (code) {
        resolve({ status: 'valid', data: code.data });
      } else {
        // If both attempts fail, the QR code is likely not scannable.
        resolve({ status: 'invalid', data: null });
      }
    };
    
    image.onerror = () => {
      resolve({ status: 'invalid', data: null });
    };
  });
}
