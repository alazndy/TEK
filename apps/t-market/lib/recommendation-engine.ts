import { OnboardingProfile, AppInfo, PackageBundle, RecommendationResult } from '@/types/onboarding';

// App Catalog
export const APP_CATALOG: AppInfo[] = [
  {
    id: 'uph',
    name: 'UPH (Unified Project Hub)',
    description: 'Proje, görev ve finansal yönetim merkezi',
    icon: '📊',
    monthlyPrice: 29,
    features: ['Proje Takibi', 'Kanban/Gantt', 'ECR/ECO', 'RAID Log', 'Focus Mode'],
    category: 'project'
  },
  {
    id: 'env-i',
    name: 'ENV-I',
    description: 'Akıllı envanter ve depo yönetimi',
    icon: '📦',
    monthlyPrice: 19,
    features: ['Stok Takibi', 'Barkod/QR', 'Depo Yönetimi', 'Otomatik Uyarılar'],
    category: 'inventory'
  },
  {
    id: 'weave',
    name: 'Weave',
    description: 'Elektronik tasarım ve BOM yönetimi',
    icon: '🔧',
    monthlyPrice: 39,
    features: ['Şematik Düzenleyici', 'BOM Export', 'JLCPCB Entegrasyonu', 'Versiyon Kontrolü'],
    category: 'design'
  },
  {
    id: 't-sa',
    name: 'T-SA (Spec Analyzer)',
    description: 'Teknik doküman ve spesifikasyon analizi',
    icon: '📋',
    monthlyPrice: 15,
    features: ['PDF Analizi', 'Parametre Çıkarımı', 'Karşılaştırma', 'AI Destekli'],
    category: 'analytics'
  },
  {
    id: 'renderci',
    name: 'Renderci',
    description: '3D görselleştirme ve render servisi',
    icon: '🎨',
    monthlyPrice: 25,
    features: ['3D Render', 'Animasyon', 'Cloud Render', 'Export Formatları'],
    category: 'design'
  }
];

// Package Bundles
export const PACKAGE_BUNDLES: PackageBundle[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Küçük ekipler için temel paket',
    apps: ['uph'],
    monthlyPricePerUser: 0,
    trialDays: 15,
    highlight: '15 Gün Ücretsiz Dene',
    recommended: false
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Orta ölçekli ekipler için',
    apps: ['uph', 'env-i'],
    monthlyPricePerUser: 39,
    trialDays: 15,
    highlight: 'En Popüler'
  },
  {
    id: 'engineer-pro',
    name: 'Mühendis Pro',
    description: 'Mühendislik ekipleri için tam paket',
    apps: ['uph', 'weave', 'env-i', 't-sa'],
    monthlyPricePerUser: 79,
    trialDays: 15,
    highlight: 'BOM + ECR/ECO',
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Kurumsal çözümler, özel fiyatlandırma',
    apps: ['uph', 'weave', 'env-i', 't-sa', 'renderci'],
    monthlyPricePerUser: -1, // Contact for pricing
    trialDays: 30,
    highlight: 'İletişime Geç'
  }
];

// Scoring weights for recommendations
const PAIN_POINT_APP_MAP: Record<string, string[]> = {
  'project-tracking': ['uph'],
  'inventory': ['env-i'],
  'bom-management': ['weave', 'uph'],
  'design-versioning': ['weave'],
  'compliance': ['uph', 't-sa'],
  'field-operations': ['env-i'],
  'analytics': ['t-sa', 'uph'],
  'collaboration': ['uph']
};

const INDUSTRY_WEIGHTS: Record<string, string[]> = {
  'defense': ['uph', 't-sa', 'weave'],
  'medical': ['uph', 't-sa', 'env-i'],
  'electronics': ['weave', 'uph', 'renderci'],
  'energy': ['uph', 'env-i'],
  'automotive': ['weave', 'uph', 'env-i'],
  'manufacturing': ['env-i', 'uph'],
  'software': ['uph'],
  'other': ['uph']
};

export function getRecommendations(profile: Partial<OnboardingProfile>): RecommendationResult {
  const appScores: Record<string, number> = {};
  
  // Initialize scores
  APP_CATALOG.forEach(app => { appScores[app.id] = 0; });
  
  // Score based on pain points
  if (profile.painPoints) {
    profile.painPoints.forEach(pain => {
      const relevantApps = PAIN_POINT_APP_MAP[pain] || [];
      relevantApps.forEach(appId => {
        appScores[appId] = (appScores[appId] || 0) + 25;
      });
    });
  }
  
  // Score based on industry
  if (profile.industry) {
    const industryApps = INDUSTRY_WEIGHTS[profile.industry] || [];
    industryApps.forEach((appId, idx) => {
      appScores[appId] = (appScores[appId] || 0) + (15 - idx * 3);
    });
  }
  
  // Score based on team size
  if (profile.teamSize === '100+') {
    appScores['uph'] += 10;
    appScores['env-i'] += 10;
  }
  
  // Get top apps
  const sortedApps = Object.entries(appScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 10);
  
  const recommendedAppIds = sortedApps.slice(0, 4).map(([id]) => id);
  
  // Find best matching package
  const packageScores = PACKAGE_BUNDLES.map(pkg => {
    const matchingApps = pkg.apps.filter(appId => recommendedAppIds.includes(appId));
    return {
      package: pkg,
      score: (matchingApps.length / pkg.apps.length) * 100
    };
  }).sort((a, b) => b.score - a.score);
  
  // Build result
  const matchScore = packageScores[0]?.score || 50;
  
  // Generate reasoning
  let reasoning = 'Profilinize göre ';
  if (profile.industry) {
    reasoning += `${profile.industry} sektöründe çalıştığınız için `;
  }
  if (profile.painPoints?.length) {
    reasoning += 'belirttiğiniz sorunlara en uygun çözümler önerildi.';
  }
  
  return {
    packages: packageScores
      .filter(p => p.score > 30 || p.package.id === 'enterprise')
      .map(p => ({
        ...p.package,
        recommended: p.score === packageScores[0]?.score && p.package.id !== 'enterprise'
      })),
    individualApps: APP_CATALOG.filter(app => recommendedAppIds.includes(app.id)),
    matchScore: Math.round(matchScore),
    reasoning
  };
}
