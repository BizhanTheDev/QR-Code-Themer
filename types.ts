export enum AppState {
  IDLE = 'idle',
  GENERATING_BASE_QR = 'generating_base_qr',
  LOADING_THEME = 'loading_theme',
  LOADING_QR_CODE = 'loading_qr_code',
  VALIDATING = 'validating',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type MimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif';

export type QRSource = 'upload' | 'generate';

export type ValidationStatus = 'pending' | 'valid' | 'invalid';

export interface ValidationResult {
  status: ValidationStatus;
  data: string | null; // Decoded data from QR code
}

export interface GenerationConfig {
  seed: number | undefined;
  temperature: number;
  topP: number;
  topK: number;
}

export type BackgroundStyle = 'default' | 'gradient' | 'pattern' | 'image';

export interface GradientConfig {
  fromColor: string;
  viaColor: string;
  toColor: string;
  isAnimated: boolean;
}

export interface PatternConfig {
  color: string;
  opacity: number;
}