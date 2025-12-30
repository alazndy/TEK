
"use client"

import React, { useEffect, useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Boxes, ClipboardCheck, BarChart2, ArrowRight, FlaskConical, HardHat, History, PlusCircle } from 'lucide-react'

const steps = [
  {
    title: "ADC Envanter Sistemine Hoş Geldiniz!",
    description: "Bu kısa rehber, sistemin temel özelliklerini ve butonların işlevlerini hızlıca öğrenmenize yardımcı olacak. Hazırsanız başlayalım!",
    icon: Boxes,
  },
  {
    title: "Ürün Ekleme ve Yönetme",
    description: "'Envanter' sayfasında, sağ üstteki 'Ürün Ekle' butonuyla yeni ürünler kaydedebilirsiniz. Tablodaki her ürünün yanındaki '...' menüsünden düzenleme ve silme işlemi yapabilirsiniz.",
    icon: PlusCircle,
  },
  {
    title: "Kategori Yönetimi",
    description: "Ürünlerinizi 'Demirbaş', 'Sarf Malzeme' ve 'Stok Malzemesi' olarak ayırın. Sol menüdeki 'Ekipman', 'Sarf Malzemeler' ve 'Envanter' sekmelerinden ilgili ürünleri kolayca listeleyin.",
    icon: Boxes,
  },
  {
    title: "Fiziksel Sayım",
    description: "'Fiziksel Sayım' modunda, depodaki ürünleri sayarak sistemdeki stoklarla karşılaştırın. Farkları tespit edin ve stoklarınızı tek tıkla güncelleyin.",
    icon: ClipboardCheck,
  },
  {
    title: "Raporlar ve Detaylı Analiz",
    description: "'Raporlar' sayfasındaki 'Analiz' sekmesinden tarih aralığı seçerek, sistem aktivitelerini (kim ne yapmış, ne zaman yapmış) detaylı olarak inceleyebilirsiniz.",
    icon: BarChart2,
  },
  {
    title: "İşlem Kayıtları (Denetim)",
    description: "Sistemde yapılan her değişiklik (ürün ekleme, silme, güncelleme, stok sayımı) 'Denetim Kaydı' sayfasına anlık olarak kaydedilir. Böylece tam şeffaflık sağlanır.",
    icon: History,
  }
]

export function OnboardingGuide() {
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useOnboardingStore()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  // This effect ensures the dialog only opens on the client after hydration
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setIsOpen(true)
    }
  }, [hasCompletedOnboarding])


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleSkip = () => {
    handleFinish()
  }

  const handleFinish = () => {
    setHasCompletedOnboarding(true)
    setIsOpen(false)
  }

  if (hasCompletedOnboarding || !isOpen) {
    return null
  }

  const { title, description, icon: Icon } = steps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                 <Icon className="w-12 h-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center px-4">
            {description}
          </DialogDescription>
        </DialogHeader>
         <div className="flex justify-center items-center gap-2 mt-4">
            {steps.map((_, index) => (
                <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
                />
            ))}
        </div>
        <DialogFooter className="sm:justify-between mt-4">
          <Button variant="ghost" onClick={handleSkip}>
            Atla
          </Button>
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? 'Sonraki' : 'Anladım, Başlayalım!'}
            {currentStep < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
