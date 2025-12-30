"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Send,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  requestPushPermission,
  type NotificationPreferences,
  type NotificationChannel,
  type NotificationCategory,
} from "@/lib/ecosystem/notification-hub";

interface NotificationSettingsProps {
  userId: string;
}

const CHANNEL_CONFIG: Record<NotificationChannel, { icon: any; label: string; description: string }> = {
  email: { icon: Mail, label: "E-posta", description: "Önemli güncellemeler için e-posta al" },
  push: { icon: Smartphone, label: "Push Bildirim", description: "Tarayıcı bildirimleri al" },
  slack: { icon: MessageSquare, label: "Slack", description: "Slack workspace'ine bildirim gönder" },
  inApp: { icon: Bell, label: "Uygulama İçi", description: "Uygulama içi bildirim merkezi" },
  sms: { icon: Send, label: "SMS", description: "Acil durumlar için SMS al" },
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  deadline: "Deadline'lar",
  alert: "Uyarılar",
  reminder: "Hatırlatıcılar",
  status: "Durum Güncellemeleri",
  collaboration: "İşbirliği",
  system: "Sistem Bildirimleri",
};

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrefs(getNotificationPreferences(userId));
    
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, [userId]);

  const handleChannelToggle = (channel: NotificationChannel, enabled: boolean) => {
    if (!prefs) return;
    
    const updated = updateNotificationPreferences(userId, {
      channels: {
        ...prefs.channels,
        [channel]: { ...prefs.channels[channel], enabled },
      },
    });
    setPrefs(updated);
  };

  const handleCategoryToggle = (channel: NotificationChannel, category: NotificationCategory, enabled: boolean) => {
    if (!prefs) return;
    
    const currentCategories = prefs.channels[channel].categories;
    const newCategories = enabled
      ? [...currentCategories, category]
      : currentCategories.filter((c) => c !== category);
    
    const updated = updateNotificationPreferences(userId, {
      channels: {
        ...prefs.channels,
        [channel]: { ...prefs.channels[channel], categories: newCategories },
      },
    });
    setPrefs(updated);
  };

  const handleRequestPush = async () => {
    setLoading(true);
    const granted = await requestPushPermission();
    setPushPermission(granted ? "granted" : "denied");
    setLoading(false);
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    if (!prefs) return;
    
    const updated = updateNotificationPreferences(userId, {
      quietHours: { ...prefs.quietHours!, enabled },
    });
    setPrefs(updated);
  };

  const handleQuietHoursChange = (field: "start" | "end", value: string) => {
    if (!prefs || !prefs.quietHours) return;
    
    const updated = updateNotificationPreferences(userId, {
      quietHours: { ...prefs.quietHours, [field]: value },
    });
    setPrefs(updated);
  };

  if (!prefs) return null;

  const channels = Object.keys(CHANNEL_CONFIG) as NotificationChannel[];
  const categories = Object.keys(CATEGORY_LABELS) as NotificationCategory[];

  return (
    <div className="space-y-6">
      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Kanalları</CardTitle>
          <CardDescription>
            Bildirimleri almak istediğiniz kanalları seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {channels.map((channel) => {
            const config = CHANNEL_CONFIG[channel];
            const Icon = config.icon;
            const channelPrefs = prefs.channels[channel];

            return (
              <div key={channel} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="font-medium">{config.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {channel === "push" && pushPermission !== "granted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRequestPush}
                        disabled={pushPermission === "denied" || loading}
                      >
                        {pushPermission === "denied" ? "Engellendi" : "İzin Ver"}
                      </Button>
                    )}
                    <Switch
                      checked={channelPrefs.enabled}
                      onCheckedChange={(v) => handleChannelToggle(channel, v)}
                      disabled={channel === "push" && pushPermission !== "granted"}
                    />
                  </div>
                </div>

                {channelPrefs.enabled && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Bildirim Kategorileri
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={
                            channelPrefs.categories.includes(category)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            handleCategoryToggle(
                              channel,
                              category,
                              !channelPrefs.categories.includes(category)
                            )
                          }
                        >
                          {CATEGORY_LABELS[category]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sessiz Saatler
          </CardTitle>
          <CardDescription>
            Bu saatler arasında acil olmayan bildirimler gönderilmez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Label>Sessiz Saatleri Etkinleştir</Label>
            <Switch
              checked={prefs.quietHours?.enabled}
              onCheckedChange={handleQuietHoursToggle}
            />
          </div>

          {prefs.quietHours?.enabled && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={prefs.quietHours.start}
                  onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                  className="w-32"
                />
              </div>
              <span className="text-muted-foreground">—</span>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={prefs.quietHours.end}
                  onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {channels.map((channel) => {
              const config = CHANNEL_CONFIG[channel];
              const channelPrefs = prefs.channels[channel];
              if (!channelPrefs.enabled) return null;

              return (
                <div key={channel} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{config.label}</span>
                  <span>{channelPrefs.categories.length} kategori aktif</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
