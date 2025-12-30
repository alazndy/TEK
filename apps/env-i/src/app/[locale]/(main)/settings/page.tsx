import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseManager } from "@/components/settings/warehouse-manager";
import { CompanySettings } from "@/components/settings/company-settings";
import { IntegrationsSettings } from "@/components/settings/integrations-settings";
import { TeamSettings } from "@/components/settings/team-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SidebarSettings } from "@/components/settings/sidebar-settings";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
      </div>
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
            <TabsTrigger value="company">Firma</TabsTrigger>
            <TabsTrigger value="team">Ekip</TabsTrigger>
            <TabsTrigger value="warehouse">Depolar</TabsTrigger>
            <TabsTrigger value="integrations">Entegrasyonlar</TabsTrigger>
            <TabsTrigger value="appearance">Görünüm</TabsTrigger>
            <TabsTrigger value="features">Modüller</TabsTrigger>
            <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
             <CompanySettings />
        </TabsContent>

        <TabsContent value="team">
              <TeamSettings />
        </TabsContent>

        <TabsContent value="warehouse">
             <WarehouseManager />
        </TabsContent>

        <TabsContent value="integrations">
             <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="appearance">
             <AppearanceSettings />
        </TabsContent>

        <TabsContent value="features">
             <SidebarSettings />
        </TabsContent>

        <TabsContent value="notifications">
             <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

