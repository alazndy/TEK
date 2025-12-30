'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';
import { TeamSettings } from '@/components/settings/team-settings';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { SystemSettings } from '@/components/settings/system-settings';
import { MaintenanceSettings } from '@/components/settings/maintenance-settings';
import { IntegrationsSettings } from '@/components/settings/integrations-settings';
import { AppearanceSettings } from '@/components/settings/appearance-settings';

import { FeatureSettings } from '@/components/settings/feature-settings';

export default function SettingsPage() {
  const t = useTranslations('Settings');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="features">Dönüşüm & Özellikler</TabsTrigger>
          <TabsTrigger value="system">{t('tabs.system')}</TabsTrigger>
          <TabsTrigger value="appearance">Görünüm</TabsTrigger>
          <TabsTrigger value="integrations">{t('integrations.title')}</TabsTrigger>
          <TabsTrigger value="team">Ekip & Organizasyon</TabsTrigger>
          <TabsTrigger value="maintenance">{t('tabs.maintenance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <ProfileSettings />
        </TabsContent>

        <TabsContent value="features">
            <FeatureSettings />
        </TabsContent>

        <TabsContent value="system">
            <SystemSettings />
        </TabsContent>

        <TabsContent value="appearance">
            <AppearanceSettings />
        </TabsContent>

        <TabsContent value="integrations">
            <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="maintenance">
            <MaintenanceSettings />
        </TabsContent>

        <TabsContent value="team">
            <TeamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

