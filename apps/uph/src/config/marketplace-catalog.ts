import { MarketplaceModule } from '@/types/marketplace';

export const MARKETPLACE_CATALOG: MarketplaceModule[] = [
  // --- UPH CORE MODULES ---
  {
    id: 'flux-core',
    name: 'Flux (IoT & Energy)',
    description: '⚡ Endüstriyel IoT izleme ve enerji yönetim modülü.',
    icon: 'Activity',
    category: 'Engineering',
    type: 'app', 
    price: 0,
    features: ['flux_core'],
    version: '2.1.0'
  },
  {
    id: 'flux-analytics',
    name: 'Flux Analytics Pro',
    description: '📈 Gelişmiş veri analizi ve kestirimci bakım.',
    icon: 'LineChart',
    category: 'Engineering',
    type: 'addon',
    parentId: 'flux-core',
    price: 49,
    isPopular: true,
    features: ['flux_charts'],
    version: '1.0.0'
  },
  {
    id: 'forge-core',
    name: 'Forge (Üretim)',
    description: '🔨 Üretim bandı yönetimi ve iş emri takibi.',
    icon: 'Hammer',
    category: 'Operations',
    type: 'app',
    price: 0,
    features: ['forge_core'],
    version: '1.5.0'
  },
  {
    id: 'forge-3d',
    name: 'Forge 3D Vision',
    description: '👓 Montaj hattı için interaktif 3D şemalar.',
    icon: 'Box',
    category: 'Operations',
    type: 'addon',
    parentId: 'forge-core',
    price: 79,
    isNew: true,
    features: ['forge_3d'],
    version: '0.9.beta'
  },

  // --- EXTERNAL ECOSYSTEM ---
  
  // ENV-I (Construction & Project Management)
  {
    id: 'envi-core',
    name: 'ENV-I OS',
    description: 'Next-gen construction project management and site tracking.',
    icon: 'Building',
    category: 'Operations',
    type: 'app',
    price: 199,
    features: ['envi_access'],
    version: '3.0.0'
  },
  {
    id: 'envi-evm',
    name: 'EVM Master',
    description: 'Earned Value Management advanced metrics for ENV-I.',
    icon: 'BarChart',
    category: 'Finance',
    type: 'addon',
    parentId: 'envi-core',
    price: 59,
    features: ['envi_evm_pro'],
    version: '1.1.0'
  },

  // WEAVE (Supply Chain)
  {
    id: 'weave-core',
    name: 'Weave Nexus',
    description: 'Collaborative supply chain mapping and node management.',
    icon: 'Network',
    category: 'Productivity',
    type: 'app',
    price: 29,
    features: ['weave_access'],
    version: '2.0.1'
  },
  {
    id: 'weave-risk',
    name: 'Supplier Risk AI',
    description: 'Real-time geopolitical risk analysis for Weave nodes.',
    icon: 'ShieldAlert',
    category: 'Productivity',
    type: 'addon',
    parentId: 'weave-core',
    price: 89,
    features: ['weave_risk_ai'],
    version: '1.0.0'
  },

  // RENDERCI (Visualization)
  {
    id: 'renderci-core',
    name: 'Renderci Studio',
    description: 'Distributed render farm management and job queuing.',
    icon: 'MonitorPlay',
    category: 'Operations',
    type: 'app',
    price: 49,
    features: ['renderci_access'],
    version: '1.2.0'
  },
  {
    id: 'renderci-kluster',
    name: 'Kluster GPU Access',
    description: 'Unlock access to high-performance remote GPU clusters.',
    icon: 'Cpu',
    category: 'Engineering',
    type: 'addon',
    parentId: 'renderci-core',
    price: 149,
    features: ['renderci_gpu'],
    version: '1.0.0'
  },

  // T-SA (Audit)
  {
    id: 'tsa-core',
    name: 'T-SA Audit',
    description: 'Technical safety audits and compliance checklists.',
    icon: 'ClipboardCheck',
    category: 'HR',
    type: 'app',
    price: 19,
    features: ['tsa_access'],
    version: '1.0.5'
  },

  // --- INTEGRATIONS (CROSS-APP) ---
  {
    id: 'smart-link',
    name: 'Smart Link: Flux x Forge',
    description: 'Auto-create maintenance jobs in Forge when Flux detects faults.',
    icon: 'Link',
    category: 'Integration',
    type: 'integration',
    price: 199,
    features: ['flux_forge_sync'],
    version: '1.0.0'
  },
  {
    id: 'eco-sync',
    name: 'EcoSync: ENV-I x Weave',
    description: 'Sync construction material requirements directly to supply chain map.',
    icon: 'RefreshCw',
    category: 'Integration',
    type: 'integration',
    price: 129,
    features: ['envi_weave_sync'],
    version: '1.0.0'
  }
];
