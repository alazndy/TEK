
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { renderImageWithStyle } from '../services/geminiService';
import { batchRenderService } from '../services/batchRenderService';
import { dataUrlToFile, fileToDataURL, getDominantColor } from '../utils/fileUtils';
import { StylePreset, Resolution, Layer, SelectionTool, NavigationDirection, SavedPrompt } from '../types';

const MUHITTIN_QUOTES = [
    "Abi o kolonlar taşımaz ama renderda hallederiz...",
    "Çayı koydum demleniyor, render da bitmek üzere...",
    "Müşteri kesin revize ister buna, demedi deme...",
    "Pikselleri tek tek diziyorum abi, az bekle.",
    "Bu ışıkta bina yıkılıyor abi, efsane olacak.",
    "Şantiyeden çağırdılar, betonu döküp geliyorum...",
    "Malzemeden çalmadan render alıyoruz, ondan uzun sürüyor.",
    "Belediye ruhsatı vermez ama render on numara.",
    "Yapay zeka değil, alın teri abi bu.",
    "Autocad'i kapat aç düzelir dediler, onu deniyorum...",
    "Bi sigara yakımlık vakit kaldı abi.",
    "UV haritalarını ütülüyorum, jilet gibi olacak.",
    "Abi arsanın imar durumuna baktım, sıkıntılı ama hallediyoruz.",
    "Gece 3'te atılan renderın tadı başka olur abi.",
    "Komşu parselden itiraz gelmeden renderı bitirelim."
];

export const useAppState = () => {
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [styleReferenceFile, setStyleReferenceFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [stylePreviewUrl, setStylePreviewUrl] = useState<string | null>(null);
    const [selectedStylePreset, setSelectedStylePreset] = useState<StylePreset | null>(null);
    const [resolution, setResolution] = useState<Resolution>('1K');
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [threeDFile, setThreeDFile] = useState<File | null>(null);
    const [resetKey, setResetKey] = useState<number>(0);
    const [history, setHistory] = useState<{ stack: string[]; index: number }>({ stack: [], index: -1 });
    const [view, setView] = useState<'uploader' | 'result'>('uploader');
    const [gallery, setGallery] = useState<string[]>([]);
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
    const [isPromptLibOpen, setIsPromptLibOpen] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isCorrecting, setIsCorrecting] = useState<boolean>(false);
    const [isExplorerMode, setIsExplorerMode] = useState<boolean>(false);
    const [tool, setTool] = useState<SelectionTool>('box');
    const [layers, setLayers] = useState<Layer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("İşleniyor...");
    const [dominantColor, setDominantColor] = useState<string>('transparent');
    const [integrationContext, setIntegrationContext] = useState<{ projectId: string; source: string } | null>(null);

    const resultImageUrl = history.index >= 0 ? history.stack[history.index] : null;

    // --- Effects ---

    useEffect(() => {
        if (isLoading || isCorrecting) {
            setLoadingMessage(MUHITTIN_QUOTES[Math.floor(Math.random() * MUHITTIN_QUOTES.length)]);
            const interval = setInterval(() => {
                setLoadingMessage(MUHITTIN_QUOTES[Math.floor(Math.random() * MUHITTIN_QUOTES.length)]);
            }, 4000);
            return () => clearInterval(interval);
        } else {
            setLoadingMessage("İşleniyor...");
        }
    }, [isLoading, isCorrecting]);

    useEffect(() => {
        if (resultImageUrl) {
            getDominantColor(resultImageUrl).then(color => {
                setDominantColor(color);
            });
        } else {
            setDominantColor('transparent');
        }
    }, [resultImageUrl]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [storedGallery, storedPrompts] = await Promise.all([
                    storageService.getGallery(),
                    storageService.getPrompts()
                ]);
                setGallery(storedGallery);
                setSavedPrompts(storedPrompts);
            } catch (e) {
                console.error("Failed to load initial data from DB", e);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const loadState = async () => {
            try {
                setIsRestoringSession(true);

                // UPH Integration Check (Priority over saved state)
                const params = new URLSearchParams(window.location.search);
                const integrate = params.get('integrate');
                const fileUrl = params.get('fileUrl');
                const fileName = params.get('fileName');
                const projectId = params.get('projectId');

                if (integrate === 'render' && fileUrl && projectId) {
                    setIntegrationContext({ projectId, source: 'uph' });
                    setLoadingMessage("Entegrasyon verileri yükleniyor...");
                    
                    try {
                        const response = await fetch(fileUrl);
                        const blob = await response.blob();
                        const file = new File([blob], fileName || 'integrated_model.glb', { type: blob.type });
                        
                        // Handle the file
                        handleFileSelect(file);
                        
                        // Clear URL params to avoid re-triggering on refresh
                        window.history.replaceState({}, document.title, window.location.pathname);
                        return; // Skip loading saved state
                    } catch (fetchErr) {
                        console.error("Entegrasyon dosyası yüklenemedi", fetchErr);
                        setError("Entegrasyon dosyası yüklenemedi.");
                    }
                }

                const savedState = await storageService.getAppState();
                if (savedState) {
                    if (savedState.sourceFileDataUrl) setSourceFile(await dataUrlToFile(savedState.sourceFileDataUrl, 'source.png'));
                    if (savedState.styleReferenceFileDataUrl) setStyleReferenceFile(await dataUrlToFile(savedState.styleReferenceFileDataUrl, 'style.png'));
                    if (savedState.prompt) setPrompt(savedState.prompt);
                    if (savedState.selectedStylePreset) setSelectedStylePreset(savedState.selectedStylePreset);
                    if (savedState.resolution) setResolution(savedState.resolution);
                    if (savedState.history) setHistory(savedState.history);
                    if (savedState.view) setView(savedState.view);
                    if (savedState.isExplorerMode) setIsExplorerMode(savedState.isExplorerMode);
                }
            } catch (e) {
                console.error("Failed to load state from DB", e);
            } finally {
                setIsInitialLoad(false);
                setIsRestoringSession(false);
            }
        };
        loadState();
    }, []);

    useEffect(() => {
        if (isInitialLoad) return;
        const saveState = async () => {
            try {
                const stateToSave = {
                    sourceFileDataUrl: sourceFile ? await fileToDataURL(sourceFile) : null,
                    styleReferenceFileDataUrl: styleReferenceFile ? await fileToDataURL(styleReferenceFile) : null,
                    prompt,
                    selectedStylePreset,
                    resolution,
                    history,
                    view,
                    isExplorerMode
                };
                await storageService.saveAppState(stateToSave);
            } catch (e) {
                console.error("Failed to save state to DB", e);
            }
        };
        const timeoutId = setTimeout(saveState, 1000);
        return () => clearTimeout(timeoutId);
    }, [sourceFile, styleReferenceFile, prompt, selectedStylePreset, resolution, history, view, isExplorerMode, isInitialLoad]);

    useEffect(() => {
        if (sourceFile) {
            const url = URL.createObjectURL(sourceFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [sourceFile]);

    useEffect(() => {
        if (styleReferenceFile) {
            const url = URL.createObjectURL(styleReferenceFile);
            setStylePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setStylePreviewUrl(null);
        }
    }, [styleReferenceFile]);

    // --- Helpers ---

    const checkApiKeyForHighRes = async () => {
        if (resolution !== '1K') {
            const aistudio = (window as any).aistudio;
            if (aistudio && aistudio.hasSelectedApiKey) {
                const hasKey = await aistudio.hasSelectedApiKey();
                if (!hasKey && aistudio.openSelectKey) {
                     await aistudio.openSelectKey();
                }
            }
        }
    };

    const saveToGallery = useCallback(async (imageUrl: string) => {
        try {
            await storageService.saveToGallery(imageUrl);
            const newGallery = await storageService.getGallery();
            setGallery(newGallery);
        } catch (e) {
            console.error("Failed to save to gallery", e);
            throw e;
        }
    }, []);

    const addNewImageToHistory = useCallback(async (imageUrl: string) => {
        try {
            await saveToGallery(imageUrl);
        } catch (e: any) {
            console.error("Gallery save warning:", e);
        }
        setHistory(prevHistory => {
            const newStack = [...prevHistory.stack.slice(0, prevHistory.index + 1), imageUrl];
            return { stack: newStack, index: newStack.length - 1 };
        });
    }, [saveToGallery]);

    const resetLayers = useCallback(() => {
        setLayers([]);
        setActiveLayerId(null);
    }, []);

    // --- Actions ---

    const reset = useCallback(async () => {
        if (!window.confirm("Mevcut çalışmayı temizlemek ve başa dönmek istediğinize emin misiniz?")) return;
        try {
            await storageService.clearAppState();
        } catch (e) {
            console.error("Reset storage failed", e);
        } finally {
            setSourceFile(null);
            setStyleReferenceFile(null);
            setSelectedStylePreset(null);
            setResolution('1K');
            setPrompt('');
            setIsLoading(false);
            setError(null);
            setHistory({ stack: [], index: -1 });
            setView('uploader');
            setIsExplorerMode(false);
            setLayers([]);
            setActiveLayerId(null);
            setIsModalOpen(false);
            setIsCorrecting(false);
            setIsGalleryOpen(false);
            setIsPromptLibOpen(false);
            setTool('box');
            setThreeDFile(null);
            setResetKey(prev => prev + 1);
            setDominantColor('transparent');
        }
    }, []);

    const handleNewFile = useCallback(() => {
        setSourceFile(null);
        setThreeDFile(null);
        setHistory({ stack: [], index: -1 });
        setView('uploader');
        setError(null);
        setIsExplorerMode(false);
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.3dm') || lowerName.endsWith('.obj') || lowerName.endsWith('.stl') || lowerName.endsWith('.step') || lowerName.endsWith('.stp')) {
            setThreeDFile(file);
            setError(null);
            return;
        }
        if (file.type.startsWith('image/')) {
            setError(null);
            setSourceFile(file);
            setHistory({ stack: [], index: -1 });
            setView('uploader');
            setIsExplorerMode(false);
            setThreeDFile(null);
        } else {
            setError('Lütfen geçerli bir görsel veya .3dm/.obj/.stl dosyası seçin.');
        }
    }, []);

    const handleThreeDCapture = useCallback((imageFile: File) => {
        setSourceFile(imageFile);
        setThreeDFile(null);
        setError(null);
    }, []);

    const handleStyleFileSelect = useCallback((file: File) => {
        if (file.type.startsWith('image/')) {
            setStyleReferenceFile(file);
            setSelectedStylePreset(null);
        } else {
            setError('Lütfen stil referansı için bir görsel dosyası seçin.');
        }
    }, []);

    const handleStyleFileRemove = useCallback(() => {
        setStyleReferenceFile(null);
    }, []);

    const handleSelectPreset = useCallback((preset: StylePreset | null) => {
        setSelectedStylePreset(preset);
        if (preset) setStyleReferenceFile(null);
    }, []);

    const handleRender = useCallback(async () => {
        if (!sourceFile) {
            setError('Lütfen bir ana görsel seçin.');
            return;
        }
        if (!prompt && !styleReferenceFile && !selectedStylePreset) {
            setError('Lütfen bir stil tanımı girin, bir referans görsel seçin veya bir ön tanımlı stil seçin.');
            return;
        }
        await checkApiKeyForHighRes();
        setIsLoading(true);
        setError(null);
        setIsExplorerMode(false);
        try {
            const imageUrl = await renderImageWithStyle(sourceFile, prompt, styleReferenceFile, selectedStylePreset, false, false, undefined, resolution);
            await addNewImageToHistory(imageUrl);
            setView('result');
        } catch (err: any) {
            setError(err.message || 'Görsel render edilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceFile, prompt, styleReferenceFile, selectedStylePreset, resolution, addNewImageToHistory]);

    const handleRegenerate = useCallback(async () => {
        if (!resultImageUrl) {
            setError('Yeniden oluşturmak için bir sonuç görseli bulunamadı.');
            return;
        }
        await checkApiKeyForHighRes();
        setIsCorrecting(true);
        setError(null);
        try {
            const currentResultFile = await dataUrlToFile(resultImageUrl, `regen-source-${Date.now()}.png`);
            const imageUrl = await renderImageWithStyle(currentResultFile, prompt, styleReferenceFile, selectedStylePreset, false, false, undefined, resolution);
            await addNewImageToHistory(imageUrl);
            const newSourceFile = await dataUrlToFile(imageUrl, `source-${Date.now()}.png`);
            setSourceFile(newSourceFile);
        } catch (err: any) {
            setError(err.message || 'Görsel yeniden oluşturulurken bir hata oluştu.');
        } finally {
            setIsCorrecting(false);
        }
    }, [resultImageUrl, prompt, styleReferenceFile, selectedStylePreset, resolution, addNewImageToHistory]);

    const handleUpscale = useCallback(async () => {
        if (!resultImageUrl) {
            setError('Yükseltmek için bir sonuç görseli bulunamadı.');
            return;
        }
        await checkApiKeyForHighRes(); // Upscale likely needs high res/pro model
        setIsCorrecting(true);
        setError(null);
        try {
            const currentResultFile = await dataUrlToFile(resultImageUrl, `upscale-source-${Date.now()}.png`);
            // Pass isUpscale = true
            const imageUrl = await renderImageWithStyle(
                currentResultFile, 
                '', // No prompt needed for pure upscale, or we can pass a hidden one
                null, 
                null, 
                false, 
                false, 
                undefined, 
                '4K', // Force High Res
                true // isUpscale flag
            );
            await addNewImageToHistory(imageUrl);
            const newSourceFile = await dataUrlToFile(imageUrl, `source-${Date.now()}.png`);
            setSourceFile(newSourceFile);
        } catch (err: any) {
            setError(err.message || 'Magic Upscale işlemi başarısız oldu.');
        } finally {
            setIsCorrecting(false);
        }
    }, [resultImageUrl, addNewImageToHistory]);

    const handleGenerateVariations = useCallback(async () => {
        if (!resultImageUrl) {
            setError('Varyasyon oluşturmak için bir sonuç görseli bulunamadı.');
            return;
        }
        await checkApiKeyForHighRes();
        setIsCorrecting(true); 
        setError(null);
        try {
            const currentResultFile = await dataUrlToFile(resultImageUrl, `variation-source-${Date.now()}.png`);
            const imageUrl = await renderImageWithStyle(currentResultFile, prompt, styleReferenceFile, selectedStylePreset, true, false, undefined, resolution);
            await addNewImageToHistory(imageUrl);
            const newSourceFile = await dataUrlToFile(imageUrl, `source-${Date.now()}.png`);
            setSourceFile(newSourceFile);
        } catch (err: any) {
            setError(err.message || 'Varyasyon oluşturulurken bir hata oluştu.');
        } finally {
            setIsCorrecting(false);
        }
    }, [resultImageUrl, prompt, styleReferenceFile, selectedStylePreset, resolution, addNewImageToHistory]);

    const handleGenerateFromSource = useCallback(async () => {
        if (!sourceFile) {
            setError('Orijinal görsel bulunamadı.');
            return;
        }
        await checkApiKeyForHighRes();
        setIsCorrecting(true);
        setError(null);
        try {
            const imageUrl = await renderImageWithStyle(sourceFile, prompt, styleReferenceFile, selectedStylePreset, false, false, undefined, resolution);
            await addNewImageToHistory(imageUrl);
        } catch (err: any) {
            setError(err.message || 'Görsel yeniden oluşturulurken bir hata oluştu.');
        } finally {
            setIsCorrecting(false);
        }
    }, [sourceFile, prompt, styleReferenceFile, selectedStylePreset, resolution, addNewImageToHistory]);

    const handleGenerateDifferentAngle = useCallback(async (newAngleFile: File) => {
        if (!resultImageUrl) {
            setError('Farklı açı oluşturmak için bir sonuç görseli bulunamadı.');
            return;
        }
        await checkApiKeyForHighRes();
        setIsCorrecting(true); 
        setError(null);
        try {
            const styleReference = await dataUrlToFile(resultImageUrl, `style-ref-${Date.now()}.png`);
            const imageUrl = await renderImageWithStyle(newAngleFile, prompt, styleReference, null, false, false, undefined, resolution);
            await addNewImageToHistory(imageUrl);
            const newSourceFile = await dataUrlToFile(imageUrl, `source-${Date.now()}.png`);
            setSourceFile(newSourceFile);
        } catch (err: any) {
            setError(err.message || 'Farklı açı oluşturulurken bir hata oluştu.');
        } finally {
            setIsCorrecting(false);
        }
    }, [resultImageUrl, prompt, resolution, addNewImageToHistory]);

    const handleOpenModal = useCallback(() => {
        if (resultImageUrl) {
            const initialLayerId = `layer_${Date.now()}`;
            setLayers([{ id: initialLayerId, prompt: '', selectionRects: [], lassoPaths: [] }]);
            setActiveLayerId(initialLayerId);
            setIsModalOpen(true);
        }
    }, [resultImageUrl]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        resetLayers();
    }, [resetLayers]);

    const handleCorrectionSubmit = useCallback(async (maskedImageFile: File, compositePrompt: string) => {
        if (!compositePrompt.trim()) return;
        await checkApiKeyForHighRes();
        setIsCorrecting(true);
        setError(null);
        try {
            const newImageUrl = await renderImageWithStyle(maskedImageFile, compositePrompt, null, null, false, true, undefined, resolution);
            await addNewImageToHistory(newImageUrl);
            const newSourceFile = await dataUrlToFile(newImageUrl, `source-${Date.now()}.png`);
            setSourceFile(newSourceFile);
            handleCloseModal();
        } catch (err: any) {
            setError(err.message || 'Görsel düzeltilirken bir hata oluştu.');
            handleCloseModal();
        } finally {
            setIsCorrecting(false);
        }
    }, [addNewImageToHistory, handleCloseModal, resolution]);

    const handleNavigateScene = useCallback(async (direction: NavigationDirection) => {
        if (!resultImageUrl) {
            setError('Navigasyon için bir sonuç görseli bulunamadı.');
            return;
        }
        await checkApiKeyForHighRes();
        setIsCorrecting(true);
        setError(null);
        try {
            const currentResultFile = await dataUrlToFile(resultImageUrl, `nav-source-${Date.now()}.png`);
            const imageUrl = await renderImageWithStyle(currentResultFile, '', null, null, false, false, direction, resolution);
            await addNewImageToHistory(imageUrl);
            const newSourceFile = await dataUrlToFile(imageUrl, `source-${Date.now()}.png`);
            setSourceFile(newSourceFile);
        } catch (err: any) {
            setError(err.message || `Sahne görünümü oluşturulurken bir hata oluştu: ${direction}`);
        } finally {
            setIsCorrecting(false);
        }
    }, [resultImageUrl, addNewImageToHistory, resolution]);

    const handleUndo = useCallback(() => {
        setHistory(prevHistory => {
            if (prevHistory.index > 0) return { ...prevHistory, index: prevHistory.index - 1 };
            return prevHistory;
        });
    }, []);

    const handleGoBack = useCallback(() => {
        setIsExplorerMode(false);
        setView('uploader');
    }, []);

    const handleShowResult = useCallback(() => {
        setView('result');
    }, []);

    const handleHistoryThumbnailClick = useCallback((index: number) => {
        setHistory(prev => ({ ...prev, index }));
    }, []);

    const handleSelectFromGallery = useCallback(async (imageUrl: string) => {
        try {
            setIsLoading(true);
            const imageFile = await dataUrlToFile(imageUrl, `gallery-image-${Date.now()}.png`);
            setError(null);
            setSourceFile(imageFile);
            setHistory({ stack: [], index: -1 });
            setView('uploader');
            setIsGalleryOpen(false);
            setIsExplorerMode(false);
        } catch (e) {
            setError("Seçilen görsel galeriden yüklenemedi.");
            console.error("Failed to convert data URL to file", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleGalleryClick = useCallback(() => setIsGalleryOpen(true), []);
    
    const onEnterExplorer = useCallback(() => setIsExplorerMode(true), []);
    const onExitExplorer = useCallback(() => setIsExplorerMode(false), []);

    // Prompt Library Handlers
    const handleSavePrompt = useCallback(async (title: string, content: string) => {
        try {
            const savedItem = await storageService.savePrompt(title, content);
            setSavedPrompts(prev => [savedItem, ...prev]);
        } catch (e) {
            console.error("Failed to save prompt", e);
        }
    }, []);

    const handleDeletePrompt = useCallback(async (id: number) => {
        try {
            await storageService.deletePrompt(id);
            setSavedPrompts(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error("Failed to delete prompt", e);
        }
    }, []);

    const handlePromptLibraryOpen = useCallback(() => setIsPromptLibOpen(true), []);
    const handlePromptLibraryClose = useCallback(() => setIsPromptLibOpen(false), []);

    const handleSaveToUPH = useCallback(() => {
        if (!resultImageUrl || !integrationContext) return;
        
        const data = {
            type: 'render_result',
            projectId: integrationContext.projectId,
            resultImageUrl: resultImageUrl,
            timestamp: new Date().toISOString()
        };

        if (window.opener) {
            window.opener.postMessage(data, '*');
            alert("Görsel UPH'a başarıyla gönderildi!");
        } else {
            const uphUrl = `http://localhost:3001/projects/${integrationContext.projectId}?integrated_result=render&data=${encodeURIComponent(resultImageUrl)}`;
            window.location.href = uphUrl;
        };
    }, [resultImageUrl, integrationContext]);

    const handleAddToQueue = useCallback(async () => {
        if (!sourceFile) {
            setError('Kuyruğa eklemek için bir dosya seçmelisiniz.');
            return;
        }
        setIsLoading(true);
        try {
            // Find or create default queue
            const queues = await batchRenderService.getAllQueues();
            let queue = queues.find(q => q.name === 'Default Queue');
            if (!queue) {
                queue = await batchRenderService.createQueue('Default Queue');
            }

            // Mock file upload (since we don't have storage bucket yet)
            const mockUrl = `http://localhost:3001/uploads/${sourceFile.name}`;
            
            await batchRenderService.addJob(queue.id, {
                name: sourceFile.name,
                url: mockUrl,
                type: '2d' 
            });
            
            alert("İşlem kuyruğa eklendi! (Backend Queue)");
        } catch (e: any) {
             setError(e.message || "Kuyruğa ekleme hatası");
        } finally {
            setIsLoading(false);
        }
    }, [sourceFile]);

    return {
        // State
        sourceFile, setSourceFile,
        styleReferenceFile,
        previewUrl,
        stylePreviewUrl,
        selectedStylePreset,
        resolution, setResolution,
        prompt, setPrompt,
        isLoading,
        error, setError,
        threeDFile, setThreeDFile,
        resetKey,
        resultImageUrl,
        history,
        view,
        gallery,
        savedPrompts,
        isGalleryOpen, setIsGalleryOpen,
        isPromptLibOpen,
        isModalOpen,
        isCorrecting,
        isExplorerMode,
        tool, setTool,
        layers, setLayers,
        activeLayerId, setActiveLayerId,
        isRestoringSession,
        dominantColor,
        loadingMessage,
        
        // Handlers
        reset,
        handleNewFile,
        handleFileSelect,
        handleThreeDCapture,
        handleStyleFileSelect,
        handleStyleFileRemove,
        handleSelectPreset,
        handleRender,
        handleRegenerate,
        handleGenerateVariations,
        handleGenerateFromSource,
        handleGenerateDifferentAngle,
        handleUpscale,
        handleOpenModal,
        handleCloseModal,
        handleCorrectionSubmit,
        handleNavigateScene,
        handleUndo,
        handleGoBack,
        handleShowResult,
        handleHistoryThumbnailClick,
        handleSelectFromGallery,
        handleGalleryClick,
        onEnterExplorer,
        onExitExplorer,
        handleSavePrompt,
        handleDeletePrompt,
        handlePromptLibraryOpen,
        handlePromptLibraryClose,
        integrationContext,
        handleSaveToUPH,
        handleAddToQueue
    };
};
