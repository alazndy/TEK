"use client"

import { useFeatureStore } from "@/stores/feature-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";

export function SidebarSettings() {
  const { features, toggleFeature } = useFeatureStore();

  return (
    <GlassCard className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-sidebar-foreground">Sidebar Modülleri</h3>
        <p className="text-sm text-muted-foreground">
          Sol menüde görmek istediğiniz modülleri buradan yönetebilirsiniz.
        </p>
      </div>
      
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 mx-[-12px] px-6">
            <div className="space-y-0.5">
              <Label htmlFor={feature.id} className="text-base font-medium">
                {feature.name}
              </Label>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Switch
              id={feature.id}
              checked={feature.enabled}
              onCheckedChange={() => toggleFeature(feature.id)}
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
