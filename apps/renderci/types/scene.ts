// Multi-Model Scene Types

export interface SceneModel {
  id: string;
  file: File;
  name: string;
  url: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  visible: boolean;
  locked: boolean;
  color?: string;
}

export interface SceneConfig {
  id: string;
  name: string;
  models: SceneModel[];
  camera: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  };
  lighting: {
    ambient: number;
    directional: { x: number; y: number; z: number };
    intensity: number;
  };
  background: string;
  gridVisible: boolean;
}

export type TransformMode = 'translate' | 'rotate' | 'scale';
