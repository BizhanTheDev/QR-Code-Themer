import { GenerationConfig, GradientConfig, PatternConfig } from '../types';

/**
 * Default generation configuration for the QR code themer.
 * To change the application's default settings, modify the values in this file.
 * These values are loaded when the application starts.
 */
export const defaultGenerationConfig: GenerationConfig = {
  seed: undefined, // `undefined` results in a random seed for each generation
  temperature: 0.4,
  topP: 1,
  topK: 32,
};

/**
 * Default creative prompt added to every generation.
 * Edit this string to permanently change the default creative instructions.
 */
export const defaultExtraPrompt: string = 'Really preserve the QR code but other elements may be added around it/add a subtle background. **IMPORTANT** Have enough contrast to make the QR Readable to phones';
export const defaultExtraPrompt2: string = '';
/**
 * Default configuration for the animated gradient background.
 */
export const defaultGradientConfig: GradientConfig = {
  fromColor: '#6366f1',
  viaColor: '#1f2937',
  toColor: '#8b5cf6',
  isAnimated: true,
};

/**
 * Default configuration for the geometric pattern background.
 */
export const defaultPatternConfig: PatternConfig = {
  color: '#374151',
  opacity: 0.1,
};
