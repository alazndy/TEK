'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    LayoutDashboard, 
    Layers, 
    Box, 
    Github, 
    ArrowRight, 
    CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
    {
        id: 'welcome',
        title: 'Unified Project Hub\'a Hoş Geldiniz',
        description: 'Tüm projelerinizi, görevlerinizi ve kaynaklarınızı tek bir yerden yönetmeye hazır olun.',
        icon: <LayoutDashboard className="w-24 h-24 text-blue-500" />
    },
    {
        id: 'projects',
        title: 'Projeler ve Görevler',
        description: 'Detaylı proje planlaması yapın, Kanban panosu ile görevlerinizi takip edin ve ekibinizle işbirliği yapın.',
        icon: <Layers className="w-24 h-24 text-purple-500" />
    },
    {
        id: 'hardware',
        title: 'Donanım Odaklı',
        description: 'Sadece yazılım değil; PCB tasarımlarınızı, 3D modellerinizi ve ürün envanterinizi de yönetin.',
        icon: <Box className="w-24 h-24 text-orange-500" />
    },
    {
        id: 'integrations',
        title: 'Tam Entegrasyon',
        description: 'GitHub projelerinizi bağlayın, Google Drive dosyalarınıza erişin ve akışınızı kesintiye uğratmayın.',
        icon: <Github className="w-24 h-24 text-zinc-100" />
    }
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();
    const { completeOnboarding, user } = useAuthStore();
    const [isCompleting, setIsCompleting] = useState(false);

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsCompleting(true);
            await completeOnboarding();
            router.push('/dashboard');
        }
    };

    const handleSkip = async () => {
        setIsCompleting(true);
        await completeOnboarding();
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-8 flex justify-center gap-2">
                    {steps.map((_, index) => (
                        <div 
                            key={index} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === currentStep ? 'w-8 bg-blue-500' : 
                                index < currentStep ? 'w-2 bg-blue-500/50' : 'w-2 bg-zinc-800'
                            }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={steps[currentStep].id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                            <CardContent className="flex flex-col items-center text-center p-12 min-h-[400px] justify-center">
                                <div className="mb-8 scale-110 p-6 bg-zinc-950/50 rounded-full border border-white/5 shadow-2xl">
                                    {steps[currentStep].icon}
                                </div>
                                <h2 className="text-3xl font-bold mb-4 tracking-tight">
                                    {steps[currentStep].title}
                                </h2>
                                <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
                                    {steps[currentStep].description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        onClick={handleSkip}
                        className="text-zinc-500 hover:text-zinc-300"
                    >
                        Geç
                    </Button>
                    <Button 
                        onClick={handleNext}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                        disabled={isCompleting}
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                Başla <CheckCircle2 className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            <>
                                İlerle <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
