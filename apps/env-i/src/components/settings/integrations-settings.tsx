"use client";

import { useDataStore } from "@/stores/data-store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { GoogleDriveService } from "@/services/google-drive-service";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export function IntegrationsSettings() {

    const { settings, updateSettings } = useDataStore();
    const [isConnected, setIsConnected] = useState(false);
    const [connectedUser, setConnectedUser] = useState<string | null>(null);

    // Initial check
    useEffect(() => {
        if (settings?.googleDriveIntegration) {
             // Ideally check if really connected, for now mock
             setIsConnected(true);
             setConnectedUser("demo_user@gmail.com");
        }
    }, [settings?.googleDriveIntegration]);

    const handleGoogleDriveToggle = async (checked: boolean) => {
        if (checked) {
             // Enable -> Wait for connect
        } else {
             // Disable
             setIsConnected(false);
             setConnectedUser(null);
        }
        await updateSettings({ googleDriveIntegration: checked });
    };

    const handleConnect = async () => {
        try {
            const res = await GoogleDriveService.connect();
            if (res.success) {
                setIsConnected(true);
                setConnectedUser(res.user || "User");
                toast({ title: "Başarılı", description: "Google Drive hesabı bağlandı." });
            }
        } catch (error) {
            toast({ title: "Hata", description: "Bağlantı başarısız.", variant: "destructive" });
        }
    };

    const handleDisconnect = async () => {
         setIsConnected(false);
         setConnectedUser(null);
         toast({ title: "Başarılı", description: "Google Drive bağlantısı kesildi." });
    }

    if (!settings) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold px-1">Entegrasyonlar</h2>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Google Drive
                    </CardTitle>
                    <CardDescription>
                        ENV-I verilerini Google Drive ile senkronize edin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Google Drive Entegrasyonu</Label>
                            <p className="text-sm text-muted-foreground">
                                Veri yedekleme ve dosya yükleme özelliklerini etkinleştirir.
                            </p>
                        </div>
                        <Switch
                            checked={settings.googleDriveIntegration || false}
                            onCheckedChange={handleGoogleDriveToggle}
                        />
                    </div>

                    {settings.googleDriveIntegration && (
                        <div className="rounded-md border p-4 bg-muted/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Bağlantı Durumu</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-sm text-muted-foreground">
                                            {isConnected ? `Bağlandı (${connectedUser})` : 'Bağlı Değil'}
                                        </span>
                                    </div>
                                </div>
                                {isConnected ? (
                                    <Button variant="outline" size="sm" onClick={handleDisconnect}>
                                        Bağlantıyı Kes
                                    </Button>
                                ) : (
                                    <Button variant="default" size="sm" onClick={handleConnect}>
                                        Bağlan
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>

            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Slack
                    </CardTitle>
                    <CardDescription>
                        Stok uyarılarını ve bildirimleri Slack kanalına gönderin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Slack Bildirimleri</Label>
                            <p className="text-sm text-muted-foreground">
                                Kritik stok ve işlem bildirimlerini etkinleştirir.
                            </p>
                        </div>
                        <Switch
                            checked={settings.slackIntegration || false}
                            onCheckedChange={async (checked) => {
                                await updateSettings({ slackIntegration: checked });
                            }}
                        />
                    </div>

                    {settings.slackIntegration && (
                        <div className="grid gap-2">
                            <Label htmlFor="webhook">Webhook URL</Label>
                            <div className="flex gap-2">
                                <input
                                    id="webhook"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="https://hooks.slack.com/services/..."
                                    value={settings.slackWebhookUrl || ""}
                                    onChange={(e) => updateSettings({ slackWebhookUrl: e.target.value })}
                                />
                                <Button variant="outline" onClick={async () => {
                                    if(!settings.slackWebhookUrl) return;
                                    const { sendToSlack } = await import("@/lib/slack");
                                    await sendToSlack(settings.slackWebhookUrl, { text: "🔔 ENV-I Test Bildirimi: Slack entegrasyonu başarılı!" });
                                    toast({ title: "Başarılı", description: "Test bildirimi Slack kanalına gönderildi." });
                                }}>
                                    Test
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* UPH (T-Hub) Integration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-blue-500">📊</span> UPH (T-Hub)
                    </CardTitle>
                    <CardDescription>
                        Proje yönetimi ve envanter bağlantısı için T-Hub ile entegrasyon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>UPH Entegrasyonu</Label>
                            <p className="text-sm text-muted-foreground">
                                Projelere ürün atama ve stok takibi özelliklerini etkinleştirir.
                            </p>
                        </div>
                        <Switch
                            checked={settings.uphIntegration || false}
                            onCheckedChange={async (checked) => {
                                await updateSettings({ uphIntegration: checked });
                            }}
                        />
                    </div>

                    {settings.uphIntegration && (
                        <div className="rounded-md border p-4 bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm text-muted-foreground">
                                    UPH ile bağlantı aktif. Projeler sayfasından ürün atayabilirsiniz.
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Weave Integration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-orange-500">🧵</span> Weave (T-Weave)
                    </CardTitle>
                    <CardDescription>
                        Teknik şema tasarım aracı ile çift yönlü ürün senkronizasyonu.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Weave Entegrasyonu</Label>
                            <p className="text-sm text-muted-foreground">
                                Ürünlere Weave tasarım dosyası (.weave) ekleme özelliğini etkinleştirir.
                            </p>
                        </div>
                        <Switch
                            checked={settings.weaveIntegration || false}
                            onCheckedChange={async (checked) => {
                                await updateSettings({ weaveIntegration: checked });
                            }}
                        />
                    </div>

                    {settings.weaveIntegration && (
                        <div className="rounded-md border p-4 bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm text-muted-foreground">
                                    Weave ile bağlantı aktif. Ürün formlarında &quot;Weave Dosyası&quot; alanı görünür.
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
