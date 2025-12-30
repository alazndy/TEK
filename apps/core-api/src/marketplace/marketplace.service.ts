import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Module } from '@t-ecosystem/core-types';

@Injectable()
export class MarketplaceService {
  private products: Module[] = [
  // --- UPH CORE (Main Hub) ---
  {
    id: 'uph-core',
    name: 'UPH Core',
    description: 'Unified Project Hub - Merkezi Yönetim Platformu',
    longDescription: 'UPH (Unified Project Hub), mühendislik ve üretim şirketleri için tasarlanmış kapsamlı bir proje yönetim platformudur. T-Ecosystem ailesinin merkezi uygulamasıdır. Projelerinizi, görevlerinizi, risklerinizi (RAID) ve mühendislik değişikliklerinizi (ECR/ECO) tek bir merkezden yönetmenizi sağlar.',
    benefits: [
      'Merkezi Yönetim: Tüm projeler tek bir yerden yönetilir.',
      'EVM Metrikleri: Earned Value Management ile profesyonel performans takibi.',
      'Mühendislik Değişiklik Yönetimi: ECR ve ECO süreçleri ile kontrollü revizyon.',
      'Ekip İşbirliği: Gerçek zamanlı takım koordinasyonu ve dosya paylaşımı.'
    ],
    gallery: ['/images/uph-dashboard.png', '/images/uph-gantt.png'],
    icon: 'LayoutDashboard',
    category: 'Operations',
    type: 'app',
    price: 0,
    currency: 'USD',
    features: ['uph_core', 'kanban_board', 'raid_log', 'evm_metrics', 'ecr_eco_system'],
    version: '3.0.0',
    isPopular: true,
    url: 'http://localhost:3000'
  },

  // --- FLUX (UPH Add-on Package) ---
  {
    id: 'flux-core',
    name: 'Flux (IoT & Energy)',
    description: 'Essential IoT device monitoring and connectivity module.',
    longDescription: 'Flux provides real-time visibility into your physical infrastructure. By connecting to IoT sensors and energy meters, Flux allows you to monitor power consumption, device status, and environmental conditions across all your facilities. It transforms raw data into actionable insights to reduce costs and prevent downtime.',
    benefits: [
        'Live Monitoring: Millisecond-latency updates from all connected IoT devices.',
        'Energy Optimization: Identify power drains and optimize usage patterns.',
        'Alert System: Instant notifications for critical faults or threshold breaches.',
        'Device Management: Remote firmware updates and configuration.'
    ],
    gallery: ['/images/flux-monitor.png'],
    icon: 'Activity',
    category: 'Engineering',
    type: 'addon',
    parentId: 'uph-core',
    price: 0,
    currency: 'USD',
    features: ['flux_core'],
    version: '2.1.0',
    url: 'http://localhost:3001'
  },
  {
    id: 'flux-analytics',
    name: 'Flux Analytics Pro',
    description: 'Advanced charts, historical data, and energy predictions for Flux',
    longDescription: 'Unlock the full power of your data with Flux Analytics Pro. This package adds predictive maintenance models and long-term trend analysis to your Flux installation.',
    benefits: [
        'Predictive Maintenance: AI models forecast equipment failure before it happens.',
        'Historical Retrospective: unlimited data retention for audit and analysis.',
        'Custom Reports: Drag-and-drop report builder for engineering teams.'
    ],
    icon: 'LineChart',
    category: 'Engineering',
    type: 'addon',
    parentId: 'flux-core',
    price: 49,
    currency: 'USD',
    features: ['flux_charts'],
    version: '1.0.0',
    isPopular: true
  },

  // --- FORGE (UPH Add-on Package) ---
  {
    id: 'forge-core',
    name: 'Forge (Manufacturing)',
    description: 'Manufacturing job tracking and technician assignment module.',
    longDescription: 'Forge digitizes your manufacturing floor. Track production jobs, assign technicians, and monitor inventory consumption in real time. Designed for high-velocity manufacturing environments, Forge eliminates paper travelers and provides total visibility into your production pipeline.',
    benefits: [
        'Digital Travelers: Replace paper job sheets with interactive tablets.',
        'Technician Portal: Specific interface for floor workers to log time and status.',
        'Inventory Sync: Automatically deduct materials from stock as jobs complete.',
        'Quality Control: Integrated checkpoints and sign-off workflows.'
    ],
    gallery: ['/images/forge-floor.png'],
    icon: 'Hammer',
    category: 'Operations',
    type: 'addon',
    parentId: 'uph-core',
    price: 0,
    currency: 'USD',
    features: ['forge_core'],
    version: '1.5.0',
    url: 'http://localhost:3002'
  },
  {
    id: 'forge-3d',
    name: 'Forge 3D Vision',
    description: 'Interactive 3D schematics for assembly technicians in Forge',
    longDescription: 'Empower your technicians with interactive 3D models. Forge 3D Vision integrates CAD files directly into the job instruction panel, allowing workers to rotate, zoom, and explode assembly views.',
    benefits: [
        'Interactive CAD: View complex assemblies from any angle.',
        'Exploded Views: Visual step-by-step assembly guides.',
        'Reduced Errors: Clearer instructions lead to fewer assembly defects.'
    ],
    icon: 'Box',
    category: 'Operations',
    type: 'addon',
    parentId: 'forge-core',
    price: 79,
    currency: 'USD',
    isNew: true,
    features: ['forge_3d'],
    version: '0.9.beta'
  },

  // --- EXTERNAL ECOSYSTEM APPS ---
  
  // ENV-I (Construction & Project Management)
  {
    id: 'envi-core',
    name: 'ENV-I OS',
    description: 'Profesyonel Stok ve Envanter Yönetim Platformu',
    longDescription: 'ENV-I, mühendislik ve üretim şirketleri için tasarlanmış kapsamlı bir envanter yönetim sistemidir. Zon ve raf bazlı lokasyon takibi, seri numarası yönetimi ve akıllı stok uyarıları ile deponuzu tam kontrol altına alır.',
    benefits: [
      'Kapsamlı Stok Takibi: Ürün, ekipman ve sarf malzemelerini tek platformda yönetin.',
      'Depo Haritası: Zon ve raf bazlı görsel lokasyon takibi.',
      'Akıllı Uyarılar: Düşük stok ve bakım zamanı bildirimleri.',
      'Raporlama: Stok değeri, hareket geçmişi ve tüketim analizi.'
    ],
    gallery: ['/images/envi-site.png'],
    icon: 'Building',
    category: 'Operations',
    type: 'app',
    price: 199,
    currency: 'USD',
    features: ['envi_access', 'warehouse_map', 'smart_alerts', 'equipment_tracking'],
    version: '3.0.0',
    url: 'http://localhost:3003'
  },
  {
    id: 'envi-evm',
    name: 'EVM Master',
    description: 'Earned Value Management advanced metrics for ENV-I',
    longDescription: 'Master your project budget with standard Earned Value Management (EVM) capability. Track CPI, SPI, and forecast project completion costs with mathematical precision.',
    benefits: [
        'Standard Metrics: CPI, SPI, CV, SV calculated automatically.',
        'Cost Forecasting: Predict EAC (Estimate at Completion) based on current performance.',
        'Variance Analysis: Drill down into cost overruns by work package.'
    ],
    icon: 'BarChart',
    category: 'Finance',
    type: 'addon',
    parentId: 'envi-core',
    price: 59,
    currency: 'USD',
    features: ['envi_evm_pro'],
    version: '1.1.0'
  },

  // WEAVE (Supply Chain)
  {
    id: 'weave-core',
    name: 'Weave Nexus',
    description: 'Sistem Bağlantı Tasarım Platformu',
    longDescription: 'Weave, sistem seviyesinde bağlantı tasarım platformudur. Fiziksel ürünlerin (kameralar, monitörler, sensörler) birbirine nasıl bağlanacağını tasarlamak için kullanılır. ENV-I entegrasyonu ile ürünleri doğrudan sahneye çeker.',
    benefits: [
      'Görsel Tasarım: Sürükle-bırak arayüz ile sistem şeması oluşturma.',
      'Otomatik BOM: Tasarım bittiğinde otomatik malzeme listesi çıkarma.',
      '75+ Konnektör: Endüstri standardı zengin konnektör kütüphanesi.',
      'Teknik Şema: PDF formatında profesyonel kablolama şeması çıktısı.'
    ],
    gallery: ['/images/weave-map.png'],
    icon: 'Network',
    category: 'Productivity',
    type: 'app',
    price: 29,
    currency: 'USD',
    features: ['weave_access', 'visual_cable_design', 'auto_bom', 'connector_library'],
    version: '2.0.1',
    url: 'http://localhost:3004'
  },
  {
    id: 'weave-risk',
    name: 'Supplier Risk AI',
    description: 'Real-time geopolitical risk analysis for Weave nodes',
    longDescription: 'Protect your supply chain from global disruption. Weave Risk AI monitors news, weather, and geopolitical events to alert you of potential impacts to your suppliers before they happen.',
    benefits: [
        '24/7 Monitoring: Automated scanning of global news sources.',
        'Impact Analysis: Calculates which products are at risk from specific events.',
        'Alternative Sourcing: Suggests backup suppliers when risks are detected.'
    ],
    icon: 'ShieldAlert',
    category: 'Productivity',
    type: 'addon',
    parentId: 'weave-core',
    price: 89,
    currency: 'USD',
    features: ['weave_risk_ai'],
    version: '1.0.0'
  },

  // RENDERCI (Visualization)
  {
    id: 'renderci-core',
    name: 'Renderci Studio',
    description: 'AI Destekli Teknik Görselleştirme Platformu',
    longDescription: 'Renderci Studio, teknik çizimlerden ve 3D modellerden yüksek kaliteli görsel renderlar üreten AI destekli bir motordur. Google Gemini Vision API ile sahneleri analiz eder ve prompt bazlı iyileştirme sağlar.',
    benefits: [
      'AI Destekli Render: Prompt ile görsel iyileştirme ve fotorealistik sonuçlar.',
      '3D Model Desteği: GLB, STEP ve DXF formatlarını doğrudan okuma.',
      'Stil Presetleri: Hazır stüdyo ve dış mekan aydınlatma ayarları.',
      'Hızlı Prototipleme: Dakikalar içinde sunuma hazır görseller.'
    ],
    icon: 'MonitorPlay',
    category: 'Operations',
    type: 'app',
    price: 49,
    currency: 'USD',
    features: ['renderci_access', 'ai_render_engine', '3d_viewer', 'style_presets'],
    version: '1.2.0',
    url: 'http://localhost:3005'
  },
  {
    id: 'renderci-kluster',
    name: 'Kluster GPU Access',
    description: 'Unlock access to high-performance remote GPU clusters',
    longDescription: 'Need more power? Kluster GPU Access connects your local Renderci Studio to our high-performance cloud GPU farm. Render scenes in minutes instead of hours.',
    benefits: [
        'On-Demand Power: Access thousands of CUDA cores instantly.',
        'Cost Efficient: Pay only for the compute time you use.',
        'Secure Transfer: End-to-end encrypted asset upload and download.'
    ],
    icon: 'Cpu',
    category: 'Engineering',
    type: 'addon',
    parentId: 'renderci-core',
    price: 149,
    currency: 'USD',
    features: ['renderci_gpu'],
    version: '1.0.0'
  },

  // T-SA (Audit)
  {
    id: 'tsa-core',
    name: 'T-SA Audit',
    description: 'Teknik Şartname Analiz Platformu',
    longDescription: 'T-SA (Technical Specification Analyzer), ihale şartnamelerini ve teknik dökümanları analiz eden AI tabanlı bir platformdur. PDF şartnameleri okur, gereksinimleri çıkarır ve ENV-I stokları ile otomatik eşleştirme yapar.',
    benefits: [
      'Otomatik Analiz: 500 sayfalık teknik şartnameyi saniyeler içinde analiz edin.',
      'Ürün Eşleştirme: Gereksinimlere uygun ürünleri stoktan otomatik bulun.',
      'Datasheet Kıyaslama: Ürün özelliklerini yan yana karşılaştırın.',
      'Uyumluluk Raporu: İhale süreci için hazır uyumluluk matrisi oluşturun.'
    ],
    icon: 'ClipboardCheck',
    category: 'Analytics',
    type: 'app',
    price: 19,
    currency: 'USD',
    features: ['tsa_access', 'spec_analysis_ai', 'datasheet_compare', 'compliance_matrix'],
    version: '1.0.5',
    url: 'http://localhost:3006'
  },

  // --- INTEGRATIONS (CROSS-APP) ---
  {
    id: 'smart-link',
    name: 'Smart Link: Flux x Forge',
    longDescription: 'Smart Link creates an intelligent bridge between Flux sensors and Forge maintenance tickets. When a sensor detects a fault, a job is automatically created in Forge with the correct error codes and machine location pre-filled.',
    description: 'Auto-create maintenance jobs in Forge when Flux detects faults',
    benefits: [
        'Automated Dispatch: Eliminate manual reporting of machine failures.',
        'Faster Response: Technicians are notified the second a fault occurs.',
        'Data Continuity: Pass sensor logs directly to the repair technician.'
    ],
    icon: 'Link',
    category: 'Integration',
    type: 'integration',
    price: 199,
    currency: 'USD',
    features: ['flux_forge_sync'],
    version: '1.0.0'
  },
  {
    id: 'eco-sync',
    name: 'EcoSync: ENV-I x Weave',
    longDescription: 'Connect construction demand with supply chain reality. EcoSync pushes material requirements from ENV-I project schedules directly into Weave maps, ensuring materials acturally arrive when they are needed on site.',
    description: 'Sync construction material requirements directly to supply chain map',
    benefits: [
        'Just-in-Time Delivery: Align shipping schedules with construction milestones.',
        'Shortage Alerts: Warn project managers if supply chain delays will impact the build.',
        'Unified BOM: Single Bill of Materials across engineering and logistics.'
    ],
    icon: 'RefreshCw',
    category: 'Integration',
    type: 'integration',
    price: 199,
    currency: 'USD',
    features: ['envi_weave_sync'],
    version: '1.0.0'
  }
];

  create(createProductDto: CreateProductDto) {
    // Note: DTO is partial, so we cast to any for this mock or need full DTO
    // Keeping simple for now
    const newProduct: any = {
        id: `prod_${Math.random().toString(36).substring(7)}`,
        ...createProductDto,
        // fill defaults
        category: 'Operations',
        type: 'app', 
        features: [],
        version: '1.0.0',
        currency: 'USD',
        icon: 'Box'
    };
    this.products.push(newProduct);
    return newProduct;
  }

  findAll() {
    return this.products;
  }

  findOne(id: string) {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundException(`Product #${id} not found`);

    const updatedProduct = { ...this.products[index], ...updateProductDto };
    // @ts-ignore
    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  remove(id: string) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundException(`Product #${id} not found`);
    this.products.splice(index, 1);
    return { deleted: true };
  }
}
