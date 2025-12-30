'use client';

import { useFeatureStore, FeatureCategory } from '@/stores/feature-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings2, 
  Database, 
  ShieldCheck, 
  Wallet, 
  Users,
  Wrench
} from 'lucide-react';

const categoryIcons: Record<FeatureCategory, any> = {
  engineering: Wrench,
  projects: Settings2,
  inventory: Database,
  risk: ShieldCheck,
  finance: Wallet,
  team: Users
};

const categoryLabels: Record<FeatureCategory, string> = {
  engineering: 'Mühendislik & PLM',
  projects: 'Proje Yönetimi',
  inventory: 'Envanter & Stok',
  risk: 'Risk & Uyumluluk',
  finance: 'Finansal Analiz',
  team: 'Ekip & Organizasyon'
};

export function FeatureSettings() {
  const { features, toggleFeature } = useFeatureStore();

  const categories = Array.from(new Set(features.map(f => f.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Modüler Özellik Yönetimi</h3>
        <p className="text-sm text-muted-foreground">
          Uygulamanın arayüzünü sektörünüze ve ihtiyaçlarınıza göre özelleştirin.
        </p>
      </div>

      <div className="grid gap-6">
        {categories.map(category => {
          const Icon = categoryIcons[category];
          const categoryFeatures = features.filter(f => f.category === category);

          return (
            <Card key={category} className="bg-zinc-950/50 border-white/10">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{categoryLabels[category]}</CardTitle>
                  <CardDescription>Bu kategoriye ait modülleri aşağıdan yönetebilirsiniz.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 mt-4">
                {categoryFeatures.map(feature => (
                  <div key={feature.id} className="flex items-center justify-between space-x-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                          {feature.name}
                        </Label>
                        {!feature.enabled && <Badge variant="outline" className="text-[10px] h-4">Devre Dışı</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {feature.description}
                      </span>
                    </div>
                    <Switch 
                      id={feature.id} 
                      checked={feature.enabled}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <p className="text-xs text-blue-400 leading-relaxed">
            <strong>Bilgi:</strong> Temel proje yönetimi, pano ve ayarlar modülleri sistemin çalışması için zorunludur ve devre dışı bırakılamaz. 
            Modülleri kapattığınızda verileriniz silinmez, sadece arayüzden gizlenir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
