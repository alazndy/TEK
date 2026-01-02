# T-Ecosystem Monorepo

<div align="center">

![T-Ecosystem](https://img.shields.io/badge/T--Ecosystem-Monorepo-00A86B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlnb24gcG9pbnRzPSIxMiAyIDIgNyAxMiAxMiAyMiA3IDEyIDIiPjwvcG9seWdvbj48cG9seWxpbmUgcG9pbnRzPSIyIDE3IDEyIDIyIDIyIDE3Ij48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9IjIgMTIgMTIgMTcgMjIgMTIiPjwvcG9seWxpbmU+PC9zdmc+)

**Teknik işletmeler için entegre iş yönetim platformu**

[![pnpm](https://img.shields.io/badge/pnpm-10.x-F69220?logo=pnpm)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo)](https://turbo.build/)

</div>

---

## 📖 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Uygulamalar](#-uygulamalar)
- [Paylaşılan Paketler](#-paylaşılan-paketler)
- [Kurulum](#-kurulum)
- [Geliştirme](#-geliştirme)
- [Mimari](#-mimari)
- [Entegrasyonlar](#-entegrasyonlar)

---

## 🌐 Genel Bakış

T-Ecosystem, teknik işletmeler için geliştirilmiş **end-to-end iş yönetim platformudur**. Proje yönetimi, envanter takibi, teknik tasarım, ihale analizi ve render işlemlerini tek çatı altında birleştirir.

```
                    ┌─────────────────────┐
                    │      T-MARKET       │
                    │   (Marketplace)     │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│      UPH      │◄──►│     ENV-I     │◄──►│     WEAVE     │
│ Project Hub   │    │   Inventory   │    │    Design     │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌───────────┐  ┌───────────┐  ┌───────────┐
       │   T-SA    │  │ RENDERCI  │  │  PORTAL   │
       │  Analyst  │  │  Render   │  │ Customer  │
       └───────────┘  └───────────┘  └───────────┘
```

---

## 📱 Uygulamalar

### UPH - Unified Project Hub

> **Proje yönetimi ve takip platformu**

| Özellik         | Açıklama                                              |
| --------------- | ----------------------------------------------------- |
| **Dashboard**   | Genel proje görünümü, KPI'lar, grafikler              |
| **RAID Log**    | Risk, varsayım, sorun, bağımlılık takibi              |
| **Gantt Chart** | İnteraktif zaman çizelgesi                            |
| **Kanban**      | Sürükle-bırak görev yönetimi                          |
| **Focus Mode**  | Pomodoro timer, dağınıklık engelleme, günlük hedefler |
| **Engineering** | Teknik doküman yönetimi, CAD entegrasyonu             |
| **Fleet**       | Araç/ekipman takibi                                   |

**Modüller:**

- `/(dashboard)` - Ana kontrol paneli
- `/focus` - Odaklanma modu (Pomodoro)
- `/forge` - Mühendislik araçları
- `/flux` - İş akışı otomasyonu
- `/onboarding` - Kullanıcı onboarding

**Port:** `3002` | **Teknoloji:** Next.js 15, React 19, Zustand, i18next (TR/EN)

---

### ENV-I - Inventory Management

> **Kapsamlı envanter ve stok yönetim sistemi**

| Özellik               | Açıklama                         |
| --------------------- | -------------------------------- |
| **Ürün Yönetimi**     | SKU, barkod, kategori, tedarikçi |
| **Depo Takibi**       | Çoklu depo, raf/konum yönetimi   |
| **Stok Hareketleri**  | Giriş/çıkış, transfer, sayım     |
| **Uyarı Sistemi**     | Düşük stok, tarih bazlı uyarılar |
| **Raporlama**         | Stok değeri, hareket raporları   |
| **Google Drive Sync** | Bulut yedekleme                  |

**Sayfalar:**

- `/dashboard` - Stok özeti
- `/products` - Ürün listesi ve detayları
- `/warehouses` - Depo yönetimi
- `/movements` - Stok hareketleri
- `/reports` - Raporlar

**Port:** `3001` | **Teknoloji:** Next.js 15, Zustand, IndexedDB, Google Drive API

---

### Weave - Design Studio

> **Kablo/sistem tasarım ve şematik oluşturma aracı**

| Özellik               | Açıklama                          |
| --------------------- | --------------------------------- |
| **Şematik Editör**    | Sürükle-bırak bileşen yerleştirme |
| **BOM Oluşturucu**    | Otomatik malzeme listesi          |
| **Kablo Hesaplama**   | Uzunluk, kesit, gerilim düşümü    |
| **PCB Entegrasyonu**  | JLCPCB/PCBWay export              |
| **Versiyon Kontrolü** | Proje geçmişi, karşılaştırma      |
| **Google Drive Sync** | Bulut yedekleme                   |

**Bileşenler:**

- `SchematicEditor` - Ana tasarım canvas
- `ComponentLibrary` - Bileşen kütüphanesi
- `WireManager` - Kablo yönetimi
- `PropertyPanel` - Özellik düzenleyici
- `BomPanel` - Malzeme listesi

**Port:** `3003` | **Teknoloji:** Vite, React 19, Zustand, Canvas API

---

### T-SA - Technical Specification Analyst

> **AI destekli teknik şartname analiz platformu**

| Özellik                     | Açıklama                       |
| --------------------------- | ------------------------------ |
| **PDF Analizi**             | Şartname dökümanı parsing      |
| **Gereksinim Çıkarma**      | Teknik spesifikasyon tespiti   |
| **Ürün Eşleştirme**         | ENV-I ile otomatik matching    |
| **Datasheet Karşılaştırma** | Yan yana spesifikasyon tablosu |
| **Maliyet Tahmini**         | Toplam proje maliyeti          |

**Port:** `5173` | **Teknoloji:** Vite, React 19, Google Gemini AI

---

### Renderci - AI Render Engine

> **Teknik görselleştirme ve AI render platformu**

| Özellik                  | Açıklama                         |
| ------------------------ | -------------------------------- |
| **AI Render**            | Gemini destekli görsel oluşturma |
| **3D Görüntüleyici**     | GLB/GLTF model görüntüleme       |
| **Multi-Model Composer** | Çoklu model sahneleme            |
| **Lighting Panel**       | Güneş yönü, sıcaklık kontrolleri |
| **Outpainting**          | Canvas genişletme                |
| **Style Transfer**       | Stil aktarma                     |
| **Export**               | PNG/JPG/TIFF/PSD, AI upscale     |

**Port:** `5174` | **Teknoloji:** Vite, React 19, Three.js, Google Gemini AI

---

### T-Market - Ecosystem Marketplace

> **T-Ecosystem uygulama mağazası**

| Özellik               | Açıklama                          |
| --------------------- | --------------------------------- |
| **Uygulama Kataloğu** | Tüm uygulamaların listesi         |
| **Onboarding Wizard** | AI destekli uygulama önerisi      |
| **Paket Sistemleri**  | Starter, Professional, Enterprise |
| **Abonelik Yönetimi** | Stripe entegrasyonu               |
| **Deneme Sürümü**     | 15 gün ücretsiz deneme            |

**Port:** `3000` | **Teknoloji:** Next.js 15, Stripe, Firebase Auth

---

### Portal - Customer Portal

> **Müşteri self-servis portalı**

| Özellik               | Açıklama                     |
| --------------------- | ---------------------------- |
| **Unified Login**     | Tek oturum açma              |
| **Uygulama Launcher** | Hızlı uygulama erişimi       |
| **Onboarding Wizard** | Kullanıcı profil oluşturma   |
| **Tercih Yönetimi**   | Tema, dil, bildirim ayarları |

**Port:** `4000` | **Teknoloji:** Vite, React 19, Zustand

---

### Core-API - Backend Services (Phase 2)

> **Merkezi API sunucusu**

| Özellik            | Açıklama                         |
| ------------------ | -------------------------------- |
| **REST API**       | Tüm uygulamalar için unified API |
| **Authentication** | JWT, OAuth2                      |
| **Database**       | PostgreSQL, Prisma ORM           |
| **Queue**          | Redis, Bull.js                   |

**Port:** `4001` | **Teknoloji:** NestJS, Prisma, PostgreSQL (Planlanıyor)

---

## 📦 Paylaşılan Paketler

### `@tek/ui-kit`

Shadcn tabanlı paylaşılan UI bileşenleri

```tsx
import { Button, Card, Dialog } from "@tek/ui-kit";
```

### `@tek/core-types`

Tüm uygulamalar için ortak TypeScript tipleri

```tsx
import { User, Project, Product } from "@tek/core-types";
```

### `@tek/integrations`

Harici servis entegrasyonları

```tsx
import { GoogleDriveService } from "@tek/integrations";
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 20+
- pnpm 10+
- Git

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/alazndy/TEK.git
cd tek-ui

# Bağımlılıkları yükle
pnpm install

# Tüm uygulamaları başlat
pnpm dev
```

### Ortam Değişkenleri

Her uygulama için `.env.local` dosyası oluşturun:

```env
# Ortak
NEXT_PUBLIC_API_URL=http://localhost:4001

# ENV-I & Weave
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# T-SA & Renderci
VITE_GEMINI_API_KEY=your_gemini_api_key

# T-Market
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

## 💻 Geliştirme

### Komutlar

| Komut                     | Açıklama                          |
| ------------------------- | --------------------------------- |
| `pnpm dev`                | Tüm uygulamaları dev modda başlat |
| `pnpm build`              | Tüm uygulamaları derle            |
| `pnpm lint`               | Lint kontrolü                     |
| `pnpm test`               | Testleri çalıştır                 |
| `pnpm dev --filter=uph`   | Sadece UPH'ı başlat               |
| `pnpm dev --filter=env-i` | Sadece ENV-I'ı başlat             |

### Port Tablosu

| Uygulama | Port | URL                   |
| -------- | ---- | --------------------- |
| T-Market | 3000 | http://localhost:3000 |
| ENV-I    | 3001 | http://localhost:3001 |
| UPH      | 3002 | http://localhost:3002 |
| Weave    | 3003 | http://localhost:3003 |
| Portal   | 4000 | http://localhost:4000 |
| Core-API | 4001 | http://localhost:4001 |
| T-SA     | 5173 | http://localhost:5173 |
| Renderci | 5174 | http://localhost:5174 |

---

## 🏗 Mimari

```
tek-ui/
├── apps/
│   ├── core-api/           # NestJS Backend (Phase 2)
│   ├── env-i/              # Envanter Yönetimi
│   │   └── src/
│   │       ├── app/        # Next.js App Router
│   │       ├── components/ # UI Bileşenleri
│   │       ├── stores/     # Zustand State
│   │       └── services/   # API Servisleri
│   ├── portal/             # Müşteri Portalı
│   │   └── src/
│   │       ├── features/   # Feature modules
│   │       └── stores/     # Global state
│   ├── renderci/           # AI Render
│   ├── t-market/           # Marketplace
│   ├── t-sa/               # Şartname Analizi
│   ├── uph/                # Proje Yönetimi
│   │   └── src/
│   │       ├── app/[locale]/ # i18n routing
│   │       │   ├── (dashboard)/ # Ana panel
│   │       │   ├── focus/       # Odaklanma modu
│   │       │   ├── forge/       # Mühendislik
│   │       │   └── flux/        # İş akışları
│   │       ├── components/
│   │       └── features/
│   └── weave/              # Tasarım Stüdyosu
│
├── packages/
│   ├── core-types/         # Paylaşılan tipler
│   ├── integrations/       # Harici entegrasyonlar
│   │   └── src/
│   │       └── google-drive/ # Google Drive API
│   └── ui-kit/            # Shadcn bileşenler
│
├── turbo.json              # Turborepo config
├── pnpm-workspace.yaml     # Workspace tanımı
└── package.json            # Root package
```

---

## 🔗 Entegrasyonlar

### Uygulama Arası Entegrasyonlar

| Kaynak   | Hedef    | Entegrasyon                      |
| -------- | -------- | -------------------------------- |
| UPH      | ENV-I    | Proje malzemeleri stoktan çek    |
| UPH      | T-SA     | Proje şartnamesini analiz et     |
| UPH      | Renderci | Proje görsellerini render et     |
| T-SA     | ENV-I    | Eşleşen ürünleri bul             |
| Weave    | ENV-I    | BOM ürünlerini stokta kontrol et |
| Renderci | UPH      | Render'ları projeye kaydet       |

### Harici Entegrasyonlar

| Servis            | Kullanan Uygulamalar | Amaç            |
| ----------------- | -------------------- | --------------- |
| **Google Drive**  | ENV-I, Weave         | Bulut yedekleme |
| **Google Gemini** | T-SA, Renderci       | AI işlemleri    |
| **Stripe**        | T-Market             | Ödeme işlemleri |
| **Firebase**      | T-Market, Portal     | Authentication  |
| **JLCPCB/PCBWay** | Weave                | PCB siparişi    |

---

## 📄 Lisans

MIT License - © 2024 T-Ecosystem

---

<div align="center">

**T-Ecosystem** tarafından ❤️ ile geliştirildi

[Website](https://tekecosystem.com) • [Dokümantasyon](https://docs.tekecosystem.com) • [Destek](mailto:support@tekecosystem.com)

</div>
