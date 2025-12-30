# UPH - Unified Project Hub

<div align="center">

![UPH Logo](https://via.placeholder.com/150?text=UPH)

**Mühendislik Projeleri İçin Merkezi Yönetim Platformu**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

[Demo](#) • [Dokümantasyon](#) • [Kurulum](#kurulum) • [Özellikler](#özellikler)

</div>

---

## 📖 Hakkında

UPH (Unified Project Hub), mühendislik ve üretim şirketleri için tasarlanmış kapsamlı bir proje yönetim platformudur. T-Ecosystem ailesinin merkezi uygulamasıdır.

### Neden UPH?

- 🎯 **Merkezi Yönetim**: Tüm projeleriniz tek bir yerden
- 📊 **EVM Metrikleri**: Earned Value Management ile performans takibi
- 🔧 **ECR/ECO Sistemi**: Mühendislik değişiklik yönetimi
- 🤝 **Ekip İşbirliği**: Gerçek zamanlı takım koordinasyonu
- 🔗 **Ekosistem Entegrasyonu**: ENV-I, Weave, Renderci, T-SA ile bağlantı

---

## ✨ Özellikler

### Proje Yönetimi

- Proje oluşturma ve düzenleme
- Durum takibi (Planning, Active, On Hold, Completed)
- Öncelik belirleme
- Etiketleme sistemi
- Favori projeler

### Görev Yönetimi

- Alt görevler
- Kanban panosu
- Görev durumları
- Yorumlar
- Tarih takibi

### Mühendislik Değişiklik Yönetimi

- **ECR** (Engineering Change Request)
  - Değişiklik talepleri
  - Etki analizi
  - Onay süreci
- **ECO** (Engineering Change Order)
  - Değişiklik emirleri
  - Revizyon takibi
  - MRP entegrasyonu

### Risk ve Performans

- **RAID Log** (Risk, Assumption, Issue, Dependency)
- **EVM Metrikleri** (CPI, SPI, EAC, ETC)
- Risk matrisi
- Performans göstergeleri

### Bütçe Yönetimi

- Bütçe planlaması
- Harcama takibi
- Bütçe kullanım oranı
- Maliyet analizi

### Fatura Sistemi

- Fatura oluşturma
- Müşteri yönetimi
- Ödeme takibi
- PDF export

### Zaman Takibi

- Proje bazlı zaman girişi
- Haftalık raporlar
- Fatura entegrasyonu

### Entegrasyonlar

- **GitHub**: Commit, PR, Issue takibi
- **Google Drive**: Dosya yönetimi
- **ENV-I**: Stok durumu
- **Weave**: Tasarım dosyaları
- **T-SA**: AI analiz

---

## 🛠️ Teknoloji Yığını

| Kategori  | Teknoloji          |
| --------- | ------------------ |
| Framework | Next.js 16         |
| Dil       | TypeScript 5       |
| State     | Zustand            |
| UI        | Shadcn/ui          |
| Stil      | Tailwind CSS 4     |
| Animasyon | Framer Motion      |
| Backend   | Firebase Firestore |
| Auth      | Firebase Auth      |
| Storage   | Firebase Storage   |
| AI        | Google Gemini      |

---

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- pnpm

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/your-repo/UPH.git
cd UPH-main

# Bağımlılıkları yükle
pnpm install

# Geliştirme sunucusunu başlat
pnpm dev
```

### Ortam Değişkenleri

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

---

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   └── [locale]/
│       └── (dashboard)/
│           ├── analytics/
│           ├── dashboard/
│           ├── engineering/
│           ├── inventory/
│           ├── invoices/
│           ├── kanban/
│           ├── planning/
│           ├── projects/
│           ├── settings/
│           ├── teams/
│           ├── templates/
│           └── time-tracking/
├── components/             # React bileşenleri
├── stores/                 # Zustand store'ları
├── types/                  # TypeScript tip tanımları
├── lib/                    # Yardımcı fonksiyonlar
└── services/               # API servisleri
```

---

## 🎨 Ekran Görüntüleri

### Dashboard

![Dashboard](https://via.placeholder.com/800x450?text=Dashboard)

### Proje Detay

![Project](https://via.placeholder.com/800x450?text=Project+Detail)

### Kanban

![Kanban](https://via.placeholder.com/800x450?text=Kanban+Board)

---

## 📊 Store Yapısı

| Store             | İşlev               |
| ----------------- | ------------------- |
| ProjectStore      | Proje yönetimi      |
| TeamStore         | Ekip yönetimi       |
| ECMStore          | ECR/ECO yönetimi    |
| RiskStore         | RAID yönetimi       |
| InvoiceStore      | Fatura yönetimi     |
| TimeStore         | Zaman takibi        |
| InventoryStore    | Envanter görünümü   |
| GitHubStore       | GitHub entegrasyonu |
| NotificationStore | Bildirimler         |
| SettingsStore     | Ayarlar             |

---

## 🔗 T-Ecosystem Entegrasyonu

UPH, T-Ecosystem'in merkez noktasıdır:

```
                    ┌─────────┐
                    │   UPH   │
                    │ (Merkez)│
                    └────┬────┘
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │  ENV-I  │    │  Weave  │    │   T-SA  │
    │  (Stok) │    │(Tasarım)│    │  (AI)   │
    └─────────┘    └────┬────┘    └─────────┘
                        │
                  ┌─────┴─────┐
                  │ Renderci  │
                  │  (3D)     │
                  └───────────┘
```

---

## 📄 Lisans

Bu proje özel lisans altındadır.

---

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing`)
5. Pull Request açın

---

<div align="center">

**T-Ecosystem** tarafından ❤️ ile geliştirildi

</div>
