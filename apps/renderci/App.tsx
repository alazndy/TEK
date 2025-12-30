import React, { useCallback, useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { ImageModal } from './components/ImageModal';
import { GalleryModal } from './components/GalleryModal';
import { InputPanel } from './components/InputPanel';
import { ThreeDViewer } from './components/ThreeDViewer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useAppState } from './hooks/useAppState';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from './lib/utils';
import { useAuth } from './context/auth-context';
import { LoginScreen } from './components/LoginScreen';


const App: React.FC = () => {
    const [showWelcome, setShowWelcome] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('renderci_welcome_dismissed') !== 'true';
        }
        return true;
    });

    const handleCloseWelcome = () => {
        localStorage.setItem('renderci_welcome_dismissed', 'true');
        setShowWelcome(false);
    };

    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();


    const {
        sourceFile,
        previewUrl,
        stylePreviewUrl,
        selectedStylePreset,
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
        handleSaveToUPH
    } = useAppState();

    const handlePromptKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading) handleRender();
        }
    }, [handleRender, isLoading]);

    const renderMainContent = () => {
        if (isRestoringSession) {
             return (
                <div className="flex flex-col justify-center items-center h-full min-h-[400px]">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-primary font-bold tracking-widest animate-pulse uppercase text-xs">Sistem Yapılandırılıyor...</p>
                </div>
            );
        }
        
        if (threeDFile) {
            return (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full"
                >
                    <ThreeDViewer 
                        file={threeDFile} 
                        onCapture={handleThreeDCapture} 
                        onCancel={() => setThreeDFile(null)} 
                    />
                </motion.div>
            );
        }

        if (view === 'result' && resultImageUrl) {
            return (
                <ResultDisplay
                    key={`result-${resetKey}`}
                    imageUrl={resultImageUrl}
                    sourceImageUrl={previewUrl}
                    onEdit={handleOpenModal}
                    isLoading={isCorrecting}
                    loadingMessage={loadingMessage}
                    onUndo={handleUndo}
                    canUndo={history.index > 0}
                    onRegenerate={handleRegenerate}
                    onGoBack={handleGoBack}
                    onGenerateVariations={handleGenerateVariations}
                    onGenerateDifferentAngle={handleGenerateDifferentAngle}
                    onGenerateFromSource={handleGenerateFromSource}
                    onUpscale={handleUpscale}
                    onNewFile={handleNewFile}
                    historyStack={history.stack}
                    currentIndex={history.index}
                    onThumbnailClick={handleHistoryThumbnailClick}
                    isExplorerMode={isExplorerMode}
                    onEnterExplorer={onEnterExplorer}
                    onExitExplorer={onExitExplorer}
                    onNavigate={handleNavigateScene}
                    onSaveToUPH={handleSaveToUPH}
                />
            );
        }

        if (sourceFile) {
            return (
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full relative"
                    >
                         <div className="glass-panel p-4 rounded-3xl h-full flex items-center justify-center overflow-hidden border-white/5 bg-slate-900/40">
                            <img src={previewUrl || ''} alt="Source" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl" />
                         </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        <InputPanel 
                            key={`input-panel-${resetKey}`}
                            stylePreviewUrl={stylePreviewUrl}
                            onStyleFileSelect={handleStyleFileSelect}
                            onStyleFileRemove={handleStyleFileRemove}
                            selectedStylePreset={selectedStylePreset}
                            onSelectPreset={handleSelectPreset}
                            prompt={prompt}
                            setPrompt={setPrompt}
                            onPromptKeyDown={handlePromptKeyDown}
                            onRender={handleRender}
                            isLoading={isLoading}
                            loadingMessage={loadingMessage}
                            resultImageUrl={resultImageUrl}
                            onShowResult={handleShowResult}
                            savedPrompts={savedPrompts}
                            onSavePrompt={handleSavePrompt}
                            onDeletePrompt={handleDeletePrompt}
                            isPromptLibOpen={isPromptLibOpen}
                            onOpenPromptLib={handlePromptLibraryOpen}
                            onClosePromptLib={handlePromptLibraryClose}
                            onNewFile={handleNewFile}
                        />
                    </motion.div>
                </div>
            );
        }
        
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-3xl"
                >
                    <ImageUploader key={`uploader-empty-${resetKey}`} onImageSelect={handleFileSelect} previewUrl={null} />
                </motion.div>
            </div>
        );
    };



    if (isAuthLoading) {
         return <div className="h-screen flex items-center justify-center bg-black text-white">Yükleniyor...</div>;
    }

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    return (

        <>
            {showWelcome && (
                <WelcomeScreen 
                    onNewProject={handleCloseWelcome}
                    onOpenFile={handleCloseWelcome}
                    onSettings={handleCloseWelcome}
                    onClose={handleCloseWelcome}
                />
            )}
            
            <div className="h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white overflow-hidden relative">
            
            {/* Ambient dynamic layer */}
            <div 
                className="absolute inset-0 z-[-1] transition-all duration-[3000ms] ease-in-out pointer-events-none"
                style={{ 
                    background: dominantColor !== 'transparent' 
                        ? `radial-gradient(circle at 50% 50%, ${dominantColor}33 0%, transparent 70%)` 
                        : undefined,
                }}
            />

            <Header onGalleryClick={handleGalleryClick} onReset={reset} />
            
            <main className="flex-1 w-full relative overflow-hidden">
                <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1700px] mx-auto w-full h-full relative flex flex-col">
                        
                        <AnimatePresence mode="wait">
                            {isLoading && !resultImageUrl && !threeDFile && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col justify-center items-center bg-background/90 backdrop-blur-xl z-50 rounded-4xl border border-white/5 p-8 text-center"
                                >
                                    <div className="relative">
                                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-indigo-400 animate-pulse" />
                                    </div>
                                    <p className="mt-8 text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-300 animate-pulse italic uppercase tracking-tighter">
                                        "{loadingMessage}"
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-4 font-black uppercase tracking-widest">T-ECOSYSTEM NEURAL RENDERER</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.div 
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mb-6 p-5 glass-panel border-red-500/20 text-red-200 rounded-2xl flex justify-between items-center shadow-red-500/10 shadow-2xl animate-in fade-in slide-in-from-top-4"
                            >
                                <span className="flex items-center gap-4">
                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                    <span className="font-bold text-sm tracking-tight">{error}</span>
                                </span>
                                <button onClick={() => setError(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors font-bold">&times;</button>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            <div className="h-full min-h-0 flex-shrink flex-grow">
                                {renderMainContent()}
                            </div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <ImageModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                imageUrl={resultImageUrl || ''}
                tool={tool}
                setTool={setTool}
                layers={layers}
                setLayers={setLayers}
                activeLayerId={activeLayerId}
                setActiveLayerId={setActiveLayerId}
                onSubmit={handleCorrectionSubmit}
                isLoading={isCorrecting}
            />
            
            <GalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={gallery}
                onImageSelect={handleSelectFromGallery}
            />

            {/* Subtle Ecosystem Signature */}
            <div className="fixed bottom-4 right-8 pointer-events-none opacity-20">
                 <div className="flex items-center gap-2 font-black text-[10px] tracking-[0.3em] uppercase">
                    <span className="text-primary font-bold">R</span>-ENGINE v4.2
                 </div>
            </div>
        </div>
        </>
    );
};

export default App;
