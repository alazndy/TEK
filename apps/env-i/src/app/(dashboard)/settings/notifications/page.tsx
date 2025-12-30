'use client';

import React, { useEffect, useState } from 'react';
import { 
  notificationService, 
  NotificationSettings, 
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationChannel
} from '@/services/notification-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Save, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Package,
  Calendar,
  Truck,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const data = await notificationService.getSettings();
    setSettings(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await notificationService.updateSettings(settings);
      toast({
        title: 'Ayarlar Kaydedildi',
        description: 'Bildirim ayarları başarıyla güncellendi.',
      });
    } catch {
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilemedi.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testSlackWebhook = async () => {
    if (!settings.slackWebhookUrl) {
      toast({
        title: 'Webhook URL Gerekli',
        description: 'Lütfen önce Slack Webhook URL girin.',
        variant: 'destructive',
      });
      return;
    }

    setTestingSlack(true);
    try {
      const response = await fetch(settings.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ ENV-I Bildirim Testi - Bağlantı başarılı!',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Test Başarılı',
          description: 'Slack kanaliniza test mesajı gönderildi.',
        });
      } else {
        throw new Error('Webhook failed');
      }
    } catch {
      toast({
        title: 'Test Başarısız',
        description: 'Webhook URL kontrol edin veya CORS nedeniyle test edilemiyor olabilir.',
        variant: 'destructive',
      });
    } finally {
      setTestingSlack(false);
    }
  };

  const toggleChannel = (
    alertType: 'lowStockAlert' | 'expiringLotAlert' | 'transferAlert' | 'orderAlert',
    channel: NotificationChannel
  ) => {
    const currentChannels = settings[alertType].channels;
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];
    
    setSettings({
      ...settings,
      [alertType]: {
        ...settings[alertType],
        channels: newChannels,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bildirim Ayarları</h2>
        <p className="text-muted-foreground">
          Stok uyarıları ve sistem bildirimleri için tercihlerinizi yapılandırın
        </p>
      </div>

      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Slack Entegrasyonu
          </CardTitle>
          <CardDescription>
            Stok uyarılarını Slack kanalınıza gönderin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Slack Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Uyarıları Slack kanalına gönder
              </p>
            </div>
            <Switch
              checked={settings.slackEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, slackEnabled: checked })}
            />
          </div>

          {settings.slackEnabled && (
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slackWebhookUrl || ''}
                  onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
                />
                <Button 
                  variant="outline" 
                  onClick={testSlackWebhook}
                  disabled={testingSlack}
                >
                  {testingSlack ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Slack App &gt; Incoming Webhooks &gt; Add New Webhook
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            E-posta Bildirimleri
          </CardTitle>
          <CardDescription>
            Önemli uyarıları e-posta ile alın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-posta Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Kritik uyarıları e-posta olarak gönder
              </p>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
            />
          </div>

          {settings.emailEnabled && (
            <div className="space-y-2">
              <Label>E-posta Adresleri</Label>
              <Input
                placeholder="ornek@firma.com, diger@firma.com"
                value={settings.emailRecipients.join(', ')}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  emailRecipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
              />
              <p className="text-xs text-muted-foreground">
                Birden fazla adres için virgülle ayırın
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Alert Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Uyarı Türleri</h3>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-500" />
                Düşük Stok Uyarısı
              </CardTitle>
              <Switch
                checked={settings.lowStockAlert.enabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  lowStockAlert: { ...settings.lowStockAlert, enabled: checked }
                })}
              />
            </div>
          </CardHeader>
          {settings.lowStockAlert.enabled && (
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Kanallar:</Label>
                {(['in_app', 'slack', 'email'] as NotificationChannel[]).map(channel => (
                  <Badge
                    key={channel}
                    variant={settings.lowStockAlert.channels.includes(channel) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleChannel('lowStockAlert', channel)}
                  >
                    {channel === 'in_app' ? <Bell className="h-3 w-3 mr-1" /> :
                     channel === 'slack' ? <MessageSquare className="h-3 w-3 mr-1" /> :
                     <Mail className="h-3 w-3 mr-1" />}
                    {channel === 'in_app' ? 'Uygulama' : channel === 'slack' ? 'Slack' : 'E-posta'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Expiring Lot Alert */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-500" />
                Son Kullanma Tarihi Uyarısı
              </CardTitle>
              <Switch
                checked={settings.expiringLotAlert.enabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  expiringLotAlert: { ...settings.expiringLotAlert, enabled: checked }
                })}
              />
            </div>
          </CardHeader>
          {settings.expiringLotAlert.enabled && (
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Kaç gün önce:</Label>
                  <Input
                    type="number"
                    className="w-20"
                    value={settings.expiringLotAlert.daysBeforeExpiry}
                    onChange={(e) => setSettings({
                      ...settings,
                      expiringLotAlert: { ...settings.expiringLotAlert, daysBeforeExpiry: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Kanallar:</Label>
                {(['in_app', 'slack', 'email'] as NotificationChannel[]).map(channel => (
                  <Badge
                    key={channel}
                    variant={settings.expiringLotAlert.channels.includes(channel) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleChannel('expiringLotAlert', channel)}
                  >
                    {channel === 'in_app' ? 'Uygulama' : channel === 'slack' ? 'Slack' : 'E-posta'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Transfer Alert */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                Transfer Bildirimi
              </CardTitle>
              <Switch
                checked={settings.transferAlert.enabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  transferAlert: { ...settings.transferAlert, enabled: checked }
                })}
              />
            </div>
          </CardHeader>
          {settings.transferAlert.enabled && (
            <CardContent>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Kanallar:</Label>
                {(['in_app', 'slack', 'email'] as NotificationChannel[]).map(channel => (
                  <Badge
                    key={channel}
                    variant={settings.transferAlert.channels.includes(channel) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleChannel('transferAlert', channel)}
                  >
                    {channel === 'in_app' ? 'Uygulama' : channel === 'slack' ? 'Slack' : 'E-posta'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Order Alert */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-green-500" />
                Sipariş Bildirimi
              </CardTitle>
              <Switch
                checked={settings.orderAlert.enabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  orderAlert: { ...settings.orderAlert, enabled: checked }
                })}
              />
            </div>
          </CardHeader>
          {settings.orderAlert.enabled && (
            <CardContent>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Kanallar:</Label>
                {(['in_app', 'slack', 'email'] as NotificationChannel[]).map(channel => (
                  <Badge
                    key={channel}
                    variant={settings.orderAlert.channels.includes(channel) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleChannel('orderAlert', channel)}
                  >
                    {channel === 'in_app' ? 'Uygulama' : channel === 'slack' ? 'Slack' : 'E-posta'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
}
