"use client"

import { useState, useRef } from "react"
import { useDataStore } from "@/stores/data-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Building2 } from "lucide-react"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export function CompanySettings() {
  const { settings, updateSettings, loadingSettings } = useDataStore()
  const [isUploading, setIsUploading] = useState(false)
  const [companyName, setCompanyName] = useState(settings?.companyName || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state with store
  if (settings?.companyName && companyName === "" && companyName !== settings.companyName) {
      setCompanyName(settings.companyName);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 2MB'dan küçük olmalıdır.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      const storage = getStorage()
      const storageRef = ref(storage, `company/logo-${Date.now()}`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)

      await updateSettings({ logoUrl: url })
      toast({
        title: "Başarılı",
        description: "Logo güncellendi"
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Hata",
        description: "Logo yüklenirken hata oluştu",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
      await updateSettings({ companyName });
  }

  if (loadingSettings) {
      return (
          <Card>
              <CardContent className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Şirket Bilgileri
        </CardTitle>
        <CardDescription>
          Şirket adı ve logosunu buradan güncelleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label>Şirket Adı</Label>
            <div className="flex gap-2">
                <Input 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    placeholder="Şirket Adı"
                />
                <Button onClick={handleSave}>Kaydet</Button>
            </div>
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
              {settings?.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt="Company Logo"
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Upload className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Logo Yükle
              </Button>
              <p className="text-[0.8rem] text-muted-foreground">
                Önerilen boyut: 512x512px. Max: 2MB.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
