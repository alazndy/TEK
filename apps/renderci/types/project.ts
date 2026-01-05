import { StylePreset, Resolution, SavedPrompt } from '../types';

// ========== Project Types ==========

export interface RenderProject {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  renders: RenderItem[];
  settings: ProjectSettings;
  tags: string[];
}

export interface RenderItem {
  id: string;
  sourceUrl: string;
  resultUrl: string;
  prompt: string;
  stylePreset: StylePreset;
  resolution: Resolution;
  createdAt: number;
  versions: RenderVersion[];
  metadata: RenderMetadata;
}

export interface RenderVersion {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  thumbnail?: string;
}

export interface RenderMetadata {
  width: number;
  height: number;
  fileSize?: number;
  format: 'png' | 'jpg' | 'webp';
  renderTime?: number;
  model?: string;
}

export interface ProjectSettings {
  defaultStylePreset: StylePreset;
  defaultResolution: Resolution;
  autoSave: boolean;
  autoVersion: boolean;
  cloudSync: boolean;
}

// ========== Lighting Types ==========

export interface LightingConfig {
  enabled: boolean;
  sunDirection: SunDirection;
  intensity: number; // 0-200
  colorTemperature: number; // 2700K - 10000K
  shadowType: 'soft' | 'hard' | 'none';
  ambientOcclusion: boolean;
  environmentMap?: string;
  timeOfDay?: TimePreset;
}

export interface SunDirection {
  azimuth: number; // 0-360 degrees
  elevation: number; // 0-90 degrees
}

export type TimePreset = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'dusk' | 'night';

export const TIME_PRESETS: Record<TimePreset, { azimuth: number; elevation: number; temperature: number }> = {
  dawn: { azimuth: 90, elevation: 5, temperature: 3000 },
  morning: { azimuth: 120, elevation: 30, temperature: 4500 },
  noon: { azimuth: 180, elevation: 75, temperature: 5500 },
  afternoon: { azimuth: 240, elevation: 45, temperature: 5000 },
  sunset: { azimuth: 270, elevation: 10, temperature: 3500 },
  dusk: { azimuth: 280, elevation: 2, temperature: 2800 },
  night: { azimuth: 0, elevation: -10, temperature: 4000 },
};

// ========== Export Types ==========

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'tiff' | 'psd';

export interface ExportConfig {
  format: ExportFormat;
  quality: number; // 1-100 (for jpg/webp)
  bitDepth: 8 | 16; // for png/tiff
  includeLayers: boolean; // for psd
  upscale: UpscaleConfig;
  colorProfile: 'srgb' | 'adobe-rgb' | 'p3';
}

export interface UpscaleConfig {
  enabled: boolean;
  factor: 1 | 2 | 4 | 8;
  denoising: number; // 0-100
  sharpening: number; // 0-100
}

// ========== Outpainting Types ==========

export type OutpaintDirection = 'left' | 'right' | 'top' | 'bottom';

export interface OutpaintConfig {
  directions: OutpaintDirection[];
  expandSize: number; // pixels to expand
  prompt: string;
  seamBlending: number; // 0-100
}

export interface CanvasState {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  originalBounds: { x: number; y: number; width: number; height: number };
}

// ========== Style Transfer Types ==========

export interface StyleTransferConfig {
  styleImageUrl: string;
  strength: number; // 0-100
  preserveColor: boolean;
  preserveStructure: boolean;
  blendMode: 'normal' | 'overlay' | 'soft-light';
}

// ========== Batch Render Types ==========

export type BatchItemStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BatchItem {
  id: string;
  sourceUrl: string;
  prompt: string;
  stylePreset: StylePreset;
  status: BatchItemStatus;
  progress: number; // 0-100
  resultUrl?: string;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface BatchQueue {
  items: BatchItem[];
  isRunning: boolean;
  currentIndex: number;
  concurrency: number; // Max parallel renders
}

// ========== Cloud Storage Types ==========

export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive';

export interface CloudStorageConfig {
  provider: CloudProvider;
  connected: boolean;
  autoSync: boolean;
  syncFolder: string;
  lastSyncAt?: number;
}

// ========== Ecosystem Integration Types ==========

export interface UPHIntegration {
  enabled: boolean;
  projectId?: string;
  taskId?: string;
  autoAttach: boolean;
}

export interface WeaveIntegration {
  enabled: boolean;
  bomId?: string;
  componentOverlay: boolean;
}

export interface ENVIIntegration {
  enabled: boolean;
  assetId?: string;
  autoTag: boolean;
}

export interface EcosystemConfig {
  uph: UPHIntegration;
  weave: WeaveIntegration;
  envi: ENVIIntegration;
}
