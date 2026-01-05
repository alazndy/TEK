import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  TransformControls, 
  Grid, 
  Environment,
  useGLTF,
  Html,
  PerspectiveCamera
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Eye, EyeOff, Lock, Unlock, 
  Move, RotateCw, Maximize2, Camera, Layers,
  Upload, X, Check, Copy, Settings, Grid3X3,
  ChevronDown, ChevronUp, GripVertical, Box
} from 'lucide-react';
import { SceneModel, SceneConfig, TransformMode } from '../../types/scene';
import { cn } from '../../lib/utils';
import * as THREE from 'three';
import { v4 as uuid } from 'uuid';

interface MultiModelComposerProps {
  onCapture: (imageUrl: string) => void;
  onCancel: () => void;
}

// Individual 3D Model Component
const Model: React.FC<{
  model: SceneModel;
  isSelected: boolean;
  onSelect: () => void;
  transformMode: TransformMode;
  onTransformChange: (position: any, rotation: any, scale: number) => void;
}> = ({ model, isSelected, onSelect, transformMode, onTransformChange }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(model.url);
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(model.position.x, model.position.y, model.position.z);
      groupRef.current.rotation.set(
        model.rotation.x * Math.PI / 180,
        model.rotation.y * Math.PI / 180,
        model.rotation.z * Math.PI / 180
      );
      groupRef.current.scale.setScalar(model.scale);
    }
  }, [model]);

  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  if (!model.visible) return null;

  return (
    <>
      <group 
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!model.locked) onSelect();
        }}
      >
        <primitive object={clonedScene} />
        {isSelected && (
          <Html center>
            <div className="bg-primary/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap -translate-y-8">
              {model.name}
            </div>
          </Html>
        )}
      </group>
      {isSelected && !model.locked && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          onObjectChange={() => {
            if (groupRef.current) {
              onTransformChange(
                {
                  x: groupRef.current.position.x,
                  y: groupRef.current.position.y,
                  z: groupRef.current.position.z
                },
                {
                  x: groupRef.current.rotation.x * 180 / Math.PI,
                  y: groupRef.current.rotation.y * 180 / Math.PI,
                  z: groupRef.current.rotation.z * 180 / Math.PI
                },
                groupRef.current.scale.x
              );
            }
          }}
        />
      )}
    </>
  );
};

// Scene Setup Component
const SceneSetup: React.FC<{
  gridVisible: boolean;
  onCaptureReady: (gl: any, scene: any, camera: any) => void;
}> = ({ gridVisible, onCaptureReady }) => {
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
    onCaptureReady(gl, scene, camera);
  }, [gl, scene, camera, onCaptureReady]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Environment preset="studio" />
      {gridVisible && (
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#444" 
          sectionColor="#666"
          fadeDistance={30}
          fadeStrength={1}
          infiniteGrid
        />
      )}
    </>
  );
};

export const MultiModelComposer: React.FC<MultiModelComposerProps> = ({
  onCapture,
  onCancel
}) => {
  const [models, setModels] = useState<SceneModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [gridVisible, setGridVisible] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  const captureRef = useRef<{ gl: any; scene: any; camera: any } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const newModel: SceneModel = {
        id: uuid(),
        file,
        name: file.name.replace(/\.[^/.]+$/, ''),
        url,
        position: { x: Math.random() * 4 - 2, y: 0, z: Math.random() * 4 - 2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        visible: true,
        locked: false
      };
      setModels(prev => [...prev, newModel]);
      setSelectedModelId(newModel.id);
    });

    e.target.value = '';
  }, []);

  const handleUpdateModel = useCallback((id: string, updates: Partial<SceneModel>) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const handleDeleteModel = useCallback((id: string) => {
    setModels(prev => prev.filter(m => m.id !== id));
    if (selectedModelId === id) setSelectedModelId(null);
  }, [selectedModelId]);

  const handleDuplicateModel = useCallback((model: SceneModel) => {
    const duplicated: SceneModel = {
      ...model,
      id: uuid(),
      name: `${model.name} (copy)`,
      position: { 
        x: model.position.x + 1, 
        y: model.position.y, 
        z: model.position.z + 1 
      }
    };
    setModels(prev => [...prev, duplicated]);
    setSelectedModelId(duplicated.id);
  }, []);

  const handleCapture = useCallback(() => {
    if (captureRef.current) {
      const { gl, scene, camera } = captureRef.current;
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL('image/png');
      onCapture(dataUrl);
    }
  }, [onCapture]);

  const selectedModel = models.find(m => m.id === selectedModelId);

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
          onClick={() => setSelectedModelId(null)}
        >
          <Suspense fallback={null}>
            <SceneSetup 
              gridVisible={gridVisible}
              onCaptureReady={(gl, scene, camera) => {
                captureRef.current = { gl, scene, camera };
              }}
            />
            {models.map(model => (
              <Model
                key={model.id}
                model={model}
                isSelected={selectedModelId === model.id}
                onSelect={() => setSelectedModelId(model.id)}
                transformMode={transformMode}
                onTransformChange={(position, rotation, scale) => {
                  handleUpdateModel(model.id, { position, rotation, scale });
                }}
              />
            ))}
          </Suspense>
          <OrbitControls makeDefault />
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        </Canvas>

        {/* Top Toolbar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              İptal
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Model Ekle
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.obj,.fbx"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setTransformMode('translate')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                transformMode === 'translate' ? "bg-primary text-white" : "hover:bg-slate-700"
              )}
              title="Taşı (G)"
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTransformMode('rotate')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                transformMode === 'rotate' ? "bg-primary text-white" : "hover:bg-slate-700"
              )}
              title="Döndür (R)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTransformMode('scale')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                transformMode === 'scale' ? "bg-primary text-white" : "hover:bg-slate-700"
              )}
              title="Ölçekle (S)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-600" />
            <button
              onClick={() => setGridVisible(!gridVisible)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                gridVisible ? "bg-slate-600" : "hover:bg-slate-700"
              )}
              title="Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCapture}
            disabled={models.length === 0}
            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            Yakala
          </button>
        </div>

        {/* Model Count Badge */}
        <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur rounded-lg px-3 py-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{models.length} Model</span>
        </div>

        {/* Empty State */}
        {models.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Box className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">3D modeller ekleyerek başlayın</p>
              <p className="text-slate-500 text-sm mt-1">GLB, GLTF, OBJ formatları desteklenir</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Model List */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold">Sahne Modelleri</h3>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {models.length}
              </span>
            </div>

            {/* Model List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {models.map((model, index) => (
                <motion.div
                  key={model.id}
                  layout
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer",
                    selectedModelId === model.id
                      ? "bg-primary/10 border-primary/50"
                      : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                  )}
                  onClick={() => setSelectedModelId(model.id)}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                    <Box className="w-4 h-4 text-primary" />
                    <span className="flex-1 text-sm truncate">{model.name}</span>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateModel(model.id, { visible: !model.visible }); }}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      {model.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateModel(model.id, { locked: !model.locked }); }}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      {model.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>

                  {/* Transform Controls (when selected) */}
                  {selectedModelId === model.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 pt-3 border-t border-slate-700 space-y-3"
                    >
                      {/* Position */}
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase">Pozisyon</label>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          {['x', 'y', 'z'].map(axis => (
                            <div key={axis} className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 uppercase">{axis}</span>
                              <input
                                type="number"
                                step="0.1"
                                value={model.position[axis as keyof typeof model.position].toFixed(1)}
                                onChange={(e) => handleUpdateModel(model.id, { 
                                  position: { ...model.position, [axis]: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-full pl-6 pr-1 py-1 bg-slate-700 rounded text-xs text-right"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rotation */}
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase">Rotasyon</label>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          {['x', 'y', 'z'].map(axis => (
                            <div key={axis} className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 uppercase">{axis}</span>
                              <input
                                type="number"
                                step="5"
                                value={Math.round(model.rotation[axis as keyof typeof model.rotation])}
                                onChange={(e) => handleUpdateModel(model.id, { 
                                  rotation: { ...model.rotation, [axis]: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-full pl-6 pr-1 py-1 bg-slate-700 rounded text-xs text-right"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Scale */}
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase">Ölçek</label>
                        <input
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={model.scale}
                          onChange={(e) => handleUpdateModel(model.id, { scale: parseFloat(e.target.value) })}
                          className="w-full accent-primary mt-1"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>0.1x</span>
                          <span className="text-primary">{model.scale.toFixed(1)}x</span>
                          <span>5x</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDuplicateModel(model)}
                          className="flex-1 py-1.5 text-xs bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Kopyala
                        </button>
                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          className="py-1.5 px-3 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Add Model Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Model Ekle
              </button>
            </div>

            {/* Panel Footer - Quick Actions */}
            <div className="p-4 border-t border-slate-700 space-y-2">
              <button
                onClick={() => {
                  models.forEach(m => handleUpdateModel(m.id, { visible: true }));
                }}
                className="w-full py-2 text-sm bg-slate-800 rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Tümünü Göster
              </button>
              <button
                onClick={() => setModels([])}
                disabled={models.length === 0}
                className="w-full py-2 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 disabled:opacity-50"
              >
                Sahneyi Temizle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Panel Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-800 p-2 rounded-l-lg border border-r-0 border-slate-700"
        style={{ right: isPanelOpen ? 320 : 0 }}
      >
        {isPanelOpen ? <ChevronUp className="w-4 h-4 rotate-90" /> : <ChevronDown className="w-4 h-4 -rotate-90" />}
      </button>
    </div>
  );
};
