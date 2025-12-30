'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/stores/settings-store";
import { useTranslations } from 'next-intl';

export function SystemSettings() {
    const t = useTranslations('Settings');
    const { system, updateSystemSettings } = useSettingsStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('system.title')}</CardTitle>
                <CardDescription>{t('system.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">{t('system.lowStock')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('system.lowStockDesc')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="number" 
                            className="w-20" 
                            value={system.lowStockThreshold}
                            onChange={(e) => updateSystemSettings({ lowStockThreshold: Number(e.target.value) })}
                        />
                        <span className="text-sm text-muted-foreground">{t('system.units')}</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">{t('system.currency')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('system.currencyDesc')}
                        </p>
                    </div>
                    <Select 
                        value={system.currency} 
                        onValueChange={(val) => updateSystemSettings({ currency: val })}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('system.selectCurrency')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TRY">Turkish Lira (₺)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">{t('system.notifications')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('system.notificationsDesc')}
                        </p>
                    </div>
                    <Switch 
                        checked={system.enableNotifications}
                        onCheckedChange={(checked) => updateSystemSettings({ enableNotifications: checked })}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
