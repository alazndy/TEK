/**
 * Batch Render Types for Renderci
 * Queue-based rendering system for multiple files
 */

export type RenderFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'pdf';
export type RenderQuality = 'low' | 'medium' | 'high' | 'ultra';
export type RenderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface RenderJob {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: '2d' | '3d' | 'cad';
  
  // Render settings
  format: RenderFormat;
  quality: RenderQuality;
  width?: number;
  height?: number;
  backgroundColor?: string;
  transparent?: boolean;
  
  // Camera settings (for 3D)
  cameraAngle?: { x: number; y: number; z: number };
  zoom?: number;
  
  // Status
  status: RenderStatus;
  progress: number; // 0-100
  error?: string;
  
  // Output
  outputUrl?: string;
  outputSize?: number;
  
  // Timing
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number; // seconds
}

export interface BatchRenderConfig {
  format: RenderFormat;
  quality: RenderQuality;
  width: number;
  height: number;
  backgroundColor: string;
  transparent: boolean;
  
  // Parallel processing
  maxConcurrent: number;
  
  // Auto settings
  autoCamera: boolean;
  autoZoom: boolean;
}

export interface RenderQueue {
  id: string;
  name: string;
  jobs: RenderJob[];
  config: BatchRenderConfig;
  
  // Status
  status: 'idle' | 'running' | 'paused' | 'completed';
  completedCount: number;
  failedCount: number;
  
  // Timing
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Default config
export const DEFAULT_BATCH_CONFIG: BatchRenderConfig = {
  format: 'png',
  quality: 'high',
  width: 1920,
  height: 1080,
  backgroundColor: '#ffffff',
  transparent: false,
  maxConcurrent: 2,
  autoCamera: true,
  autoZoom: true,
};

// Quality presets
export const QUALITY_PRESETS: Record<RenderQuality, { width: number; height: number }> = {
  low: { width: 640, height: 480 },
  medium: { width: 1280, height: 720 },
  high: { width: 1920, height: 1080 },
  ultra: { width: 3840, height: 2160 },
};

// Format options
export const FORMAT_OPTIONS: { value: RenderFormat; label: string; extension: string }[] = [
  { value: 'png', label: 'PNG', extension: '.png' },
  { value: 'jpg', label: 'JPEG', extension: '.jpg' },
  { value: 'webp', label: 'WebP', extension: '.webp' },
  { value: 'svg', label: 'SVG', extension: '.svg' },
  { value: 'pdf', label: 'PDF', extension: '.pdf' },
];
