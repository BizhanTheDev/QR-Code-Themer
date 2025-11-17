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
 * Default configuration for the animated gradient background.
 */
export const defaultGradientConfig: GradientConfig = {
  fromColor: '#08f7fe', // Neon Cyan
  viaColor: '#e025ce', // Neon Magenta
  toColor: '#6366f1', // Indigo
  isAnimated: true,
};

/**
 * Default configuration for the geometric pattern background.
 */
export const defaultPatternConfig: PatternConfig = {
  color: '#374151',
  opacity: 0.1,
};