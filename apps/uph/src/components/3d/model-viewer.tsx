'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html, useProgress, Grid } from '@react-three/drei';
import { Loader2, AlertCircle } from 'lucide-react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-medium">{progress.toFixed(0)}% loaded</span>
      </div>
    </Html>
  );
}

function CameraLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (light.current) {
      light.current.position.copy(state.camera.position);
    }
  });
  return <pointLight ref={light} intensity={1} decay={0} distance={0} />;
}

// STL Model Loader
function STLModel({ url }: { url: string }) {
    const geom = useLoader(STLLoader, url);
    return (
        <mesh geometry={geom}>
            <meshStandardMaterial color="#808080" />
        </mesh>
    );
}

function ObjModel({ url }: { url: string }) {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} />;
}

function GltfModel({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

function Model({ url }: { url: string }) {
  // Determine file type, ignoring query parameters (e.g. ?alt=media&token=...)
  const cleanUrl = url.toLowerCase();
  const isObj = cleanUrl.includes('.obj');
  const isStl = cleanUrl.includes('.stl');
  const isStep = cleanUrl.includes('.step') || cleanUrl.includes('.stp');
  
  // Use proxy to bypass CORS only if NOT a blob URL
  const isBlob = url.startsWith('blob:');
  const safeUrl = isBlob ? url : `/api/proxy?url=${encodeURIComponent(url)}`;

  if (isStep) {
    // STEP viewing relies on complex CAD kernels (OCCT) usually not available in standard three.js loaders
    throw new Error('STEP_FORMAT_NOT_SUPPORTED');
  }

  if (isStl) return <STLModel url={safeUrl} />;
  if (isObj) return <ObjModel url={safeUrl} />;
  
  // Default to GLTF
  return <GltfModel url={safeUrl} />;
}

interface ModelViewerProps {
  url: string;
  className?: string;
}

export function ModelViewer({ url, className }: ModelViewerProps) {
  const [error, setError] = useState<string | null>(null);

  // Reset error when URL changes
  useEffect(() => {
      setError(null);
  }, [url]);

  if (error) {
      return (
          <div className={`${className} flex flex-col items-center justify-center bg-zinc-900 text-white gap-2 p-4`}>
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="font-medium">Önizleme Başarısız</p>
              <p className="text-sm text-zinc-400 text-center">{error}</p>
          </div>
      );
  }

  return (
    <div className={className}>
      <ErrorBoundary onError={(e) => setError(e.message === 'STEP_FORMAT_NOT_SUPPORTED' ? 'STEP dosyaları tarayıcıda önizlenemez. Lütfen dosyayı indirin.' : 'Model yüklenirken bir hata oluştu.')}>
          <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
            <CameraLight />
            
            {/* Infinite Grid for ground reference */}
            <Grid 
                infiniteGrid 
                fadeDistance={50} 
                fadeStrength={5}
                cellColor="#444" 
                sectionColor="#666"
                position={[0, -0.01, 0]}
            />
            <Suspense fallback={<Loader />}>
              <Stage environment="city" intensity={0.6}>
                <Model url={url} />
              </Stage>
            </Suspense>
            <OrbitControls autoRotate={false} makeDefault />
          </Canvas>
      </ErrorBoundary>
    </div>
  );
}

// Simple Error Boundary wrapper
class ErrorBoundary extends React.Component<{ children: React.ReactNode, onError: (error: any) => void }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
