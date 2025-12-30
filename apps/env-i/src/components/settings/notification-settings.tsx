"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/stores/notification-store"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export function NotificationSettings() {
  const { addNotification } = useNotificationStore();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [criticalStockAlerts, setCriticalStockAlerts] = useState(true);

  const handleTestNotification = () => {
    addNotification({
      title: "Test Bildirimi",
      message: "Bu bir test bildirimidir. Sistem sorunsuz çalışıyor.",
      type: "info"
    });
    toast({
        title: "Bildirim Gönderildi",
        description: "Bildirim merkezini kontrol edin."
    });
  };

  const requestPushPermission = async () => {
      if (!("Notification" in window)) {
        toast({ title: "Desteklenmiyor", description: "Tarayıcınız bildirimleri desteklemiyor.", variant: "destructive" });
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
          setPushNotifications(true);
          toast({ title: "İzin Verildi", description: "Bildirim izni başarıyla alındı.", variant: "default" });
          new Notification("T-ENV-I", { body: "Bildirimler aktif!" });
      } else {
          setPushNotifications(false);
          toast({ title: "İzin Reddedildi", description: "Bildirim izni vermediniz.", variant: "destructive" });
      }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Tercihleri</CardTitle>
          <CardDescription>
            Hangi durumlarda ve nasıl bildirim almak istediğinizi yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">E-posta Bildirimleri</Label>
              <Label className="text-sm font-normal text-muted-foreground">
                 Haftalık stok özeti ve kritik raporlar e-posta olarak gelsin.
              </Label>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between space-x-2">
             <div className="space-y-0.5">
              <Label className="text-base">Anlık Bildirimler (Push)</Label>
              <Label className="text-sm font-normal text-muted-foreground">
                 Tarayıcı üzerinden anlık bildirimler alın.
              </Label>
            </div>
             <Switch 
                checked={pushNotifications} 
                onCheckedChange={(checked) => {
                    if (checked) requestPushPermission();
                    else setPushNotifications(false);
                }} 
            />
          </div>

           <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Kritik Stok Uyarıları</Label>
              <Label className="text-sm font-normal text-muted-foreground">
                 Bir ürünün stoğu kritik seviyenin altına düştüğünde uyar.
              </Label>
            </div>
            <Switch checked={criticalStockAlerts} onCheckedChange={setCriticalStockAlerts} />
          </div>

          <div className="pt-4 border-t">
              <Button variant="outline" onClick={handleTestNotification}>Test Bildirimi Gönder</Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
