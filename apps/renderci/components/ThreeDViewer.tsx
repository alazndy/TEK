
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Loader } from './Loader';
import { Sun, Box, Grid } from 'lucide-react';

interface ThreeDViewerProps {
    file: File;
    onCapture: (imageFile: File) => void;
    onCancel: () => void;
}

type GizmoMode = 'translate' | 'rotate' | 'scale';

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ file, onCapture, onCancel }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
    const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [modelGroup, setModelGroup] = useState<THREE.Group | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    // Feature States
    const [isWireframe, setIsWireframe] = useState(false);
    const [isHDRI, setIsHDRI] = useState(true);

    // Gizmo State
    const [gizmoMode, setGizmoMode] = useState<GizmoMode>('rotate');
    const transformControlRef = useRef<TransformControls | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    // Update Gizmo Mode when state changes
    useEffect(() => {
        if (transformControlRef.current) {
            transformControlRef.current.setMode(gizmoMode);
        }
    }, [gizmoMode]);

    // Handle Wireframe Toggle
    useEffect(() => {
        if (modelGroup) {
            modelGroup.traverse((child: any) => {
                if (child.isMesh && child.material) {
                    // Check if it's an array of materials or single
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat: any) => mat.wireframe = isWireframe);
                    } else {
                        child.material.wireframe = isWireframe;
                    }
                }
            });
        }
    }, [isWireframe, modelGroup]);

    // Handle HDRI Toggle
    useEffect(() => {
        if (!scene || !renderer) return;
        
        if (isHDRI) {
            new RGBELoader()
                .setPath('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/')
                .load('studio_small_09_1k.hdr', function (texture) {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    scene.environment = texture;
                    scene.background = texture;
                    scene.backgroundBlurriness = 0.5; // Biraz blur ekle ki dikkati dağıtmasın
                });
        } else {
            scene.environment = null;
            scene.background = new THREE.Color(0x1a202c);
        }
    }, [isHDRI, scene, renderer]);

    useEffect(() => {
        if (!mountRef.current) return;

        // --- Console Warning Suppression ---
        const originalWarn = console.warn;
        console.warn = (...args) => {
            const msg = args[0];
            if (typeof msg === 'string' && 
               (msg.includes('THREE.3DMLoader: Conversion not implemented for ObjectType_Annotation') || 
                msg.includes('ObjectType_Annotation has no associated mesh geometry'))) {
                return;
            }
            if (typeof msg === 'object' && msg !== null) {
                if ((msg.type === 'not implemented' || msg.type === 'missing mesh') && 
                    msg.message && msg.message.includes('ObjectType_Annotation')) {
                    return;
                }
            }
            originalWarn.apply(console, args);
        };

        // Scene Setup
        const newScene = new THREE.Scene();
        newScene.background = new THREE.Color(0x1a202c); // Initial Dark gray bg
        
        // Grid Helper
        const gridHelper = new THREE.GridHelper(100, 100, 0x4a5568, 0x2d3748);
        newScene.add(gridHelper);

        // Lighting (Fallback if HDRI is off)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        newScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        newScene.add(directionalLight);

        // Camera Setup
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const newCamera = new THREE.PerspectiveCamera(45, width / height, 0.001, 1000000); 
        newCamera.position.set(20, 20, 20);

        // Renderer Setup
        const newRenderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            precision: "highp",
            alpha: true
        });
        
        newRenderer.setSize(width, height);
        newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
        newRenderer.shadowMap.enabled = true;
        newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        newRenderer.outputColorSpace = THREE.SRGBColorSpace;
        newRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        newRenderer.toneMappingExposure = 1.0;
        
        mountRef.current.appendChild(newRenderer.domElement);

        // Controls (Orbit)
        const controls = new OrbitControls(newCamera, newRenderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 0;
        controls.maxDistance = Infinity;
        controlsRef.current = controls;

        // --- GIZMO (Transform Controls) Setup ---
        const tControls = new TransformControls(newCamera, newRenderer.domElement);
        tControls.setMode(gizmoMode); 
        
        tControls.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        });
        
        newScene.add(tControls);
        transformControlRef.current = tControls;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
                if (mountRef.current) mountRef.current.style.cursor = 'grab';
            }
            if (e.key.toLowerCase() === 'g') setGizmoMode('translate');
            if (e.key.toLowerCase() === 'r') setGizmoMode('rotate');
            if (e.key.toLowerCase() === 's') setGizmoMode('scale');
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
                if (mountRef.current) mountRef.current.style.cursor = 'move';
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Initial HDRI Load
        new RGBELoader()
        .setPath('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/')
        .load('studio_small_09_1k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            newScene.environment = texture;
            newScene.background = texture;
            newScene.backgroundBlurriness = 0.5;
        });

        // Common function to process and add any loaded 3D object/mesh to the scene
        const processAndAddModel = (object: THREE.Object3D) => {
            const box = new THREE.Box3().setFromObject(object);
            if (box.isEmpty()) console.warn("Model bounding box is empty.");

            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            object.position.x -= center.x;
            object.position.y -= center.y;
            object.position.z -= center.z;
            
            const group = new THREE.Group();
            group.add(object);
            newScene.add(group);
            setModelGroup(group);

            tControls.attach(group);

            const defaultMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xcccccc,
                roughness: 0.2,
                metalness: 0.8,
                side: THREE.DoubleSide,
                envMapIntensity: 1.0
            });

            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); 

            object.traverse((child: any) => {
                if (child.isMesh) {
                    if (!child.material || Array.isArray(child.material)) {
                        child.material = defaultMaterial;
                    } else {
                        // Mevcut materyali varsa PBR özelliklerini artır
                        child.material.envMapIntensity = 1.0;
                        child.material.needsUpdate = true;
                    }
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.geometry && !child.geometry.attributes.normal) {
                         child.geometry.computeVertexNormals();
                    }
                } 
                else if (child.isLine || child.isLineSegments) {
                    child.material = lineMaterial;
                }
            });

            // Camera Fitting
            const maxDim = Math.max(size.x, size.y, size.z) || 10;
            const fov = newCamera.fov * (Math.PI / 180);
            let cameraDist = maxDim / (2 * Math.tan(fov / 2));
            cameraDist *= 1.2;

            newCamera.near = maxDim / 1000;
            newCamera.far = maxDim * 1000;
            newCamera.updateProjectionMatrix();

            const pos = cameraDist / Math.sqrt(3);
            newCamera.position.set(pos, pos, pos);
            newCamera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();

            // Grid adjust
            const gridSize = Math.max(100, maxDim * 2);
            newScene.children.forEach(c => {
                if (c instanceof THREE.GridHelper) newScene.remove(c);
            });
            const newGrid = new THREE.GridHelper(gridSize, 50, 0x4a5568, 0x2d3748);
            newScene.add(newGrid);

            setIsLoading(false);
        };

        const url = URL.createObjectURL(file);
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === '3dm') {
            const loader = new Rhino3dmLoader();
            loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@8.0.1/');
            loader.load(url, processAndAddModel, undefined, (err) => {
                console.error(err);
                setIsLoading(false);
                setErrorMsg("3DM dosyası yüklenemedi.");
            });
        } 
        else if (extension === 'obj') {
            const loader = new OBJLoader();
            loader.load(url, processAndAddModel, undefined, (err) => {
                console.error(err);
                setIsLoading(false);
                setErrorMsg("OBJ dosyası yüklenemedi.");
            });
        }
        else if (extension === 'stl') {
            const loader = new STLLoader();
            loader.load(url, (geometry) => {
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xcccccc, 
                    roughness: 0.3, 
                    metalness: 0.5,
                    envMapIntensity: 1.0
                });
                const mesh = new THREE.Mesh(geometry, material);
                processAndAddModel(mesh);
            }, undefined, (err) => {
                console.error(err);
                setIsLoading(false);
                setErrorMsg("STL dosyası yüklenemedi.");
            });
        }
        else {
            setIsLoading(false);
            setErrorMsg("Desteklenmeyen dosya formatı.");
        }

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            newRenderer.render(newScene, newCamera);
        };
        animate();

        setRenderer(newRenderer);
        setCamera(newCamera);
        setScene(newScene);

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            newCamera.aspect = w / h;
            newCamera.updateProjectionMatrix();
            newRenderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            console.warn = originalWarn;
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (mountRef.current && newRenderer.domElement) {
                mountRef.current.removeChild(newRenderer.domElement);
            }
            if (transformControlRef.current) {
                transformControlRef.current.dispose();
            }
            newRenderer.dispose();
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const handleZoom = (factor: number) => {
        if (!camera || !controlsRef.current) return;
        const controls = controlsRef.current;
        const distance = camera.position.distanceTo(controls.target);
        const newDistance = distance * factor;
        const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
        camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));
        controls.update();
    };

    const handleRotateModel = (axis: 'x' | 'y') => {
        if (!modelGroup) return;
        if (axis === 'x') modelGroup.rotation.x -= Math.PI / 2;
        else modelGroup.rotation.y -= Math.PI / 2;
    };

    const handleCapture = () => {
        if (!renderer || !scene || !camera) return;

        const gridHelper = scene.children.find(child => child instanceof THREE.GridHelper);
        const originalGridVisible = gridHelper ? gridHelper.visible : true;
        if (gridHelper) gridHelper.visible = false;

        if (transformControlRef.current) transformControlRef.current.visible = false;

        // Render with background for WYSIWYG
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL('image/png', 1.0);
        
        if (gridHelper) gridHelper.visible = originalGridVisible;
        if (transformControlRef.current) transformControlRef.current.visible = true;

        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const capturedFile = new File([blob], "3d-snapshot.png", { type: "image/png" });
                onCapture(capturedFile);
            });
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-white text-sm backdrop-blur-sm border border-white/10">
                <p>Sol Tık: Gizmo Kullan | <span className="text-yellow-400 font-bold">Shift + Sol Tık: Kaydır</span> | Tekerlek: Yakınlaştır</p>
            </div>
             <div className="absolute top-4 right-4 z-10 bg-indigo-600/80 p-2 rounded text-white text-xs backdrop-blur-sm border border-indigo-400/30 flex items-center gap-1 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                GPU Hızlandırma Aktif
            </div>

            {/* Display Mode Toggles */}
            <div className="absolute left-4 top-24 z-10">
                <div className="bg-gray-800/80 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg flex flex-col gap-3">
                    <button 
                        onClick={() => setIsHDRI(!isHDRI)}
                        className={`p-3 rounded-lg transition-all ${isHDRI ? 'bg-amber-600 text-white shadow-lg' : 'bg-gray-700/50 text-gray-400 hover:text-white'}`}
                        title="Stüdyo Işığı / HDRI"
                    >
                        <Sun size={24} />
                    </button>
                    <button 
                        onClick={() => setIsWireframe(!isWireframe)}
                        className={`p-3 rounded-lg transition-all ${isWireframe ? 'bg-cyan-600 text-white shadow-lg' : 'bg-gray-700/50 text-gray-400 hover:text-white'}`}
                        title="Tel Kafes (Wireframe)"
                    >
                        <Grid size={24} />
                    </button>
                </div>
            </div>

            {/* Gizmo Controls */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <div className="bg-gray-800/80 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg flex flex-col gap-3">
                    <button 
                        onClick={() => setGizmoMode('translate')}
                        className={`p-3 rounded-lg transition-all ${gizmoMode === 'translate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'}`}
                        title="Taşı (G)"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => setGizmoMode('rotate')}
                        className={`p-3 rounded-lg transition-all ${gizmoMode === 'rotate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'}`}
                        title="Döndür (R)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => setGizmoMode('scale')}
                        className={`p-3 rounded-lg transition-all ${gizmoMode === 'scale' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'}`}
                        title="Ölçeklendir (S)"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Quick Rotate Shortcuts */}
            <div className="absolute left-4 bottom-24 z-10">
                <div className="bg-gray-800/80 p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-lg flex flex-col gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider text-center">Hızlı Çevir</span>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => handleRotateModel('x')}
                            className="px-3 py-2 bg-gray-700 hover:bg-indigo-600 text-white text-xs font-bold rounded transition-colors flex items-center gap-1"
                            title="X ekseninde 90 derece döndür"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Dik (X)
                        </button>
                        <button 
                            onClick={() => handleRotateModel('y')}
                            className="px-3 py-2 bg-gray-700 hover:bg-indigo-600 text-white text-xs font-bold rounded transition-colors flex items-center gap-1"
                            title="Y ekseninde 90 derece döndür"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" transform="rotate(90 12 12)" />
                            </svg>
                            Yön (Y)
                        </button>
                    </div>
                </div>
            </div>

            {/* Manual Zoom Controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                <button 
                    onClick={() => handleZoom(0.8)}
                    className="p-3 bg-gray-700/80 hover:bg-indigo-600/90 text-white rounded-full backdrop-blur-md shadow-lg transition-all border border-white/10"
                    title="Yakınlaştır (+)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <button 
                    onClick={() => handleZoom(1.25)}
                    className="p-3 bg-gray-700/80 hover:bg-indigo-600/90 text-white rounded-full backdrop-blur-md shadow-lg transition-all border border-white/10"
                    title="Uzaklaştır (-)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
            </div>
            
            {isLoading && !errorMsg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-20">
                    <Loader />
                    <p className="mt-4 text-indigo-300">3D Model GPU ile İşleniyor...</p>
                </div>
            )}

            {errorMsg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 z-30 p-8 text-center">
                    <div className="text-red-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{errorMsg}</h3>
                    <button 
                        onClick={onCancel}
                        className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Geri Dön
                    </button>
                </div>
            )}
            
            <div ref={mountRef} className="w-full h-full cursor-move" />
            
            {!errorMsg && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
                    <button 
                        onClick={onCancel}
                        className="px-6 py-3 bg-gray-700/80 hover:bg-gray-600/90 backdrop-blur-md text-white font-bold rounded-lg shadow-lg transition-all border border-white/10"
                    >
                        İptal
                    </button>
                    <button 
                        onClick={handleCapture}
                        disabled={isLoading}
                        className="px-8 py-3 bg-indigo-600/90 hover:bg-indigo-500/90 backdrop-blur-md text-white font-bold rounded-lg shadow-xl shadow-indigo-900/50 flex items-center gap-2 transform hover:scale-105 transition-all border border-indigo-400/30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Bu Açıyı Renderla
                    </button>
                </div>
            )}
        </div>
    );
};
