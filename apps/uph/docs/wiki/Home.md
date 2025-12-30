# T-HUB (UPH) Wiki

T-HUB (Unified Project Hub), TEK Ekosistemi'nin proje yönetim merkezidir. Tüm mühendislik projelerinizi, finansal akışlarınızı ve ekip işbirliğinizi tek bir platformda yönetin.

## 📚 İçindekiler

- [Mimari Genel Bakış](#mimari-genel-bakış)
- [Modüller](#modüller)
- [API Referansı](#api-referansı)
- [Ekosistem Entegrasyonu](#ekosistem-entegrasyonu)
- [Kurumsal Özellikler](#kurumsal-özellikler)

---

## Mimari Genel Bakış

### Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────────┐
│                          T-HUB Frontend                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐    │
│  │ Dashboard  │ │  Projects  │ │   Kanban   │ │   Analytics    │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                        Kurumsal Modüller                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │    ECM      │ │  Resource   │ │    Risk     │ │  Security   │    │
│  │  (ECR/ECO)  │ │  Planning   │ │Intelligence │ │   (SOC 2)   │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                        State Management                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Zustand Stores                            │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │ │ project  │ │  kanban  │ │   ecm    │ │ resource/risk    │  │   │
│  │ │  store   │ │  store   │ │  store   │ │ audit stores     │  │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                          Backend                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐    │
│  │ Firestore  │ │   Auth     │ │  Storage   │ │  IndexedDB     │    │
│  │  (NoSQL)   │ │ (Firebase) │ │  (Files)   │ │ (Offline)      │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Modüller

### 📊 Proje Yönetimi

| Sekme      | Açıklama                     |
| ---------- | ---------------------------- |
| Overview   | Proje özeti, ilerleme durumu |
| Tasks      | Görev listesi ve atamalar    |
| Financials | Bütçe, harcama, karlılık     |
| Timeline   | Gantt zaman çizelgesi        |
| Files      | Google Drive entegrasyonu    |
| CAD        | DXF/DWG görüntüleyici        |

### 🔧 Mühendislik Değişim Yönetimi (ECM)

**ECR (Engineering Change Request)**

- Değişiklik talebi oluşturma
- Onay iş akışı
- Öncelik ve departman ataması

**ECO (Engineering Change Order)**

- Onaylanan değişikliklerin uygulanması
- Revizyon takibi
- Etkinlik tarihleri (Effectivity)

### 📅 Kaynak Planlama

- **Kapasite Isı Haritası**: Ekip üyelerinin günlük yükü
- **Darboğaz Tespiti**: %100 üzeri kapasite uyarıları
- **Kaynak Dengeleme**: Yük dağıtım önerileri

### ⚠️ Risk Zekası & EVM

- **RAID Log**: Risk, Varsayım, Sorun, Bağımlılık takibi
- **5x5 Risk Matrisi**: Olasılık × Etki skoru
- **EVM Metrikleri**: CPI, SPI, EAC, ETC

### 🔒 Güvenlik & Uyumluluk (SOC 2)

- **RBAC**: 6 rol, 12 yetki seviyesi
- **Audit Log**: Hash tabanlı değiştirilemez kayıt
- **SoD**: Görevler Ayrılığı kontrolü

---

## API Referansı

### Project Store

```typescript
// Proje İşlemleri
fetchProjects(): Promise<void>
addProject(project: Omit<Project, 'id'>): Promise<void>
updateProject(id: string, updates: Partial<Project>): Promise<void>
deleteProject(id: string): Promise<void>

// Görev İşlemleri
addTask(projectId: string, task: Task): Promise<void>
updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>
```

### ECM Store

```typescript
// ECR İşlemleri
fetchECRs(): Promise<void>
addECR(ecr: Omit<ECR, 'id'>): Promise<void>
updateECRStatus(id: string, status: ECRStatus): Promise<void>

// ECO İşlemleri
addECO(eco: Omit<ECO, 'id'>): Promise<void>
addRevisedItem(ecoId: string, item: RevisedItem): Promise<void>
```

### Risk Store

```typescript
// RAID İşlemleri
addRAIDEntry(entry: Omit<RAIDEntry, 'id'>): void
updateRAIDStatus(id: string, status: RAIDStatus): void
calculateProjectSummary(projectId: string): ProjectRiskSummary
```

---

## Ekosistem Entegrasyonu

### ENV-I → T-HUB

```
ENV-I Ürün → UPH Proje Malzemesi → Maliyet Hesapla → BOM Oluştur
```

- Gerçek zamanlı fiyat senkronizasyonu
- Stok seviyesi doğrulaması
- Otomatik maliyet hesaplama

### T-Weave → T-HUB

```
Weave Tasarım → BOM Export → UPH Proje → Malzeme Atama
```

- Tasarım dosyası önizleme
- Otomatik BOM içe aktarma
- Bileşen envanter bağlama

---

## Kurumsal Özellikler

### Modüler Özellik Yönetimi

Ayarlar > Özellikler sekmesinden modüller açılıp kapatılabilir:

- Mühendislik (ECM)
- Envanter
- Risk Yönetimi
- Kanban

### Offline-First Mimari

- **IndexedDB**: Yerel veri depolama
- **Sync Engine**: LWW çakışma çözümü
- **Kuyruk Sistemi**: Çevrimdışı işlem kuyruğu

### Performans Optimizasyonları

- React.memo ile bileşen memoization
- react-virtuoso ile liste virtualization
- Lazy loading ile kod bölümleme
