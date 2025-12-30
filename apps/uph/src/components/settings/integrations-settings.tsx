'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/settings-store";
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { GoogleDriveService } from '@/services/google-drive-service';
import { Button } from "@/components/ui/button";

export function IntegrationsSettings() {
    const t = useTranslations('Settings');
    const { system, updateSystemSettings } = useSettingsStore();
    const [integrations, setIntegrations] = useState(system.integrations || { weave: true, envInventory: true, googleDrive: false });
    const [connectingDrive, setConnectingDrive] = useState(false);
    const [driveUser, setDriveUser] = useState<string | null>(null);

    const handleGoogleDriveToggle = async (checked: boolean) => {
        setIntegrations(prev => ({ ...prev, googleDrive: checked }));
        updateSystemSettings({ integrations: { ...system.integrations, googleDrive: checked } });
    
        if (checked) {
            setConnectingDrive(true);
            try {
                const user = await GoogleDriveService.connect();
                setDriveUser(user.user || user.displayName || 'Unknown User');
                toast.success(t('integrations.driveConnected', { user: user.user || user.displayName || 'Unknown User' }));
            } catch (error) {
                console.error('Google Drive connection failed:', error);
                toast.error(t('integrations.driveConnectError'));
                setIntegrations(prev => ({ ...prev, googleDrive: false })); // Revert toggle on failure
                updateSystemSettings({ integrations: { ...system.integrations, googleDrive: false } });
            } finally {
                setConnectingDrive(false);
            }
        } else {
            // Disconnect logic if needed, for now just update state
            setDriveUser(null);
            toast.info(t('integrations.driveDisconnected'));
        }
      };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('integrations.title')}</CardTitle>
                <CardDescription>{t('integrations.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">{t('integrations.weave')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('integrations.weaveDesc')}
                        </p>
                    </div>
                    <Switch 
                        checked={integrations.weave ?? true}
                        onCheckedChange={(checked) => {
                            setIntegrations(prev => ({ ...prev, weave: checked }));
                            updateSystemSettings({ integrations: { ...system.integrations, weave: checked } });
                        }}
                    />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">{t('integrations.env')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('integrations.envDesc')}
                        </p>
                    </div>
                    <Switch 
                        checked={integrations.envInventory ?? true}
                        onCheckedChange={(checked) => {
                            setIntegrations(prev => ({ ...prev, envInventory: checked }));
                            updateSystemSettings({ integrations: { ...system.integrations, envInventory: checked } });
                        }}
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">{t('integrations.googleDrive')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('integrations.googleDriveDesc')}
                            {driveUser && <span className="ml-2 text-xs text-green-600">({driveUser})</span>}
                        </p>
                    </div>
                    <Switch 
                        checked={integrations.googleDrive ?? false}
                        onCheckedChange={handleGoogleDriveToggle}
                        disabled={connectingDrive}
                    />
                </div>

                <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">{t('integrations.communication')}</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">{t('integrations.slack')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('integrations.slackDesc')}
                                </p>
                            </div>
                            <Switch 
                                checked={integrations.slack ?? false}
                                onCheckedChange={(checked) => {
                                    setIntegrations(prev => ({ ...prev, slack: checked }));
                                    updateSystemSettings({ integrations: { ...system.integrations, slack: checked } });
                                }}
                            />
                        </div>
                        {integrations.slack && (
                            <div className="grid gap-2 p-4 pt-0">
                                <Label htmlFor="slack-webhook">{t('integrations.webhookUrl')}</Label>
                                <Input 
                                    id="slack-webhook" 
                                    value={system.slackWebhookUrl || ''}
                                    onChange={(e) => updateSystemSettings({ slackWebhookUrl: e.target.value })}
                                    placeholder="https://hooks.slack.com/services/..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">{t('integrations.development')}</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">{t('integrations.github')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('integrations.githubDesc')}
                                </p>
                            </div>
                            <Switch 
                                checked={integrations.github ?? false}
                                onCheckedChange={(checked) => {
                                    setIntegrations(prev => ({ ...prev, github: checked }));
                                    updateSystemSettings({ integrations: { ...system.integrations, github: checked } });
                                }}
                            />
                        </div>
                        {integrations.github && (
                            <div className="grid gap-2 p-4 pt-0">
                                <Label htmlFor="github-token">{t('integrations.githubToken')}</Label>
                                <Input 
                                    id="github-token" 
                                    type="password"
                                    value={system.githubToken || ''}
                                    onChange={(e) => updateSystemSettings({ githubToken: e.target.value })}
                                    placeholder="ghp_..."
                                />
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
