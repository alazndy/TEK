import { UserRole } from '../../stores/preferences-store';
import { 
  Palette, 
  Box, 
  BarChart3, 
  Settings, 
  ShoppingCart, 
  Layers, 
  Cpu 
} from 'lucide-react';

export interface AppDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
}

export const ALL_APPS: AppDefinition[] = [
  { id: 'uph', name: 'UPH', description: 'Unified Project Hub', icon: Layers },
  { id: 'env-i', name: 'ENV-I', description: 'Inventory Management', icon: Box },
  { id: 'weave', name: 'Weave', description: 'System Design', icon: Palette },
  { id: 't-market', name: 't-Market', description: 'Marketplace', icon: ShoppingCart },
  { id: 't-sa', name: 'T-SA', description: 'Spec Analyst', icon: BarChart3 },
  { id: 'renderci', name: 'Renderci', description: 'Visualization', icon: Cpu },
  // Core API is usually hidden or dev-only, but let's include for power users
  { id: 'core-api', name: 'Core API', description: 'Backend Services', icon: Settings },
];

export const ROLE_PRESETS: Record<string, { label: string, description: string, apps: string[] }> = {
  engineer: {
    label: 'Mühendis / Tasarımcı',
    description: 'Ürün tasarımı, teknik spekler ve görselleştirme araçları.',
    apps: ['uph', 'weave', 'renderci', 't-sa', 'env-i']
  },
  manager: {
    label: 'Proje Yöneticisi',
    description: 'Proje takibi, bütçe, ekip yönetimi ve raporlama.',
    apps: ['uph', 't-market', 't-sa']
  },
  logistics: {
    label: 'Depo / Lojistik',
    description: 'Stok takibi, ürün giriş-çıkış ve envanter yönetimi.',
    apps: ['env-i', 'uph']
  },
  power_user: {
    label: 'Power User',
    description: 'Tüm ekosisteme tam erişim.',
    apps: ALL_APPS.map(a => a.id)
  }
};
