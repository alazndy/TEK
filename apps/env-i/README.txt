# ENV-I - Envanter Yönetim Sistemi

<div align="center">

![ENV-I Logo](https://via.placeholder.com/150?text=ENV-I)

**Profesyonel Stok ve Envanter Yönetim Platformu**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

[Demo](#) • [Dokümantasyon](#) • [Kurulum](#kurulum) • [Özellikler](#özellikler)

</div>

---

## 📖 Hakkında

ENV-I, mühendislik ve üretim şirketleri için tasarlanmış kapsamlı bir envanter yönetim sistemidir. T-Ecosystem ailesinin stok yönetim uygulamasıdır.

### Neden ENV-I?

- 📦 **Kapsamlı Stok Takibi**: Ürün, ekipman ve sarf malzemeleri
- 🏭 **Depo Yönetimi**: Zon ve raf bazlı lokasyon takibi
- 🔔 **Akıllı Uyarılar**: Düşük stok bildirimleri
- 📊 **Detaylı Raporlama**: Stok değeri, hareketler, trendler
- 🔗 **Ekosistem Entegrasyonu**: UPH, Weave, T-SA ile bağlantı

---

## ✨ Özellikler

### Ürün Yönetimi

- Ürün ekleme ve düzenleme
- SKU/Barkod yönetimi
- Kategori ve alt kategori
- Resim ve döküman ekleme
- Teknik spesifikasyonlar

### Ekipman Yönetimi

- Seri numarası takibi
- Garanti takibi
- Bakım geçmişi
- Lokasyon takibi

### Sarf Malzemeleri

- Lot numarası takibi
- Son kullanma tarihi
- Tüketim analizi

### Depo Yönetimi

- Çoklu depo desteği
- Zon tanımlama
- Raf yönetimi
- Görsel depo haritası

### Stok Hareketleri

- Giriş/Çıkış işlemleri
- Depolar arası transfer
- Fiziksel sayım
- Hareket geçmişi

### Sipariş Yönetimi

- Satın alma talepleri
- Onay süreci
- Tedarikçi yönetimi
- Teklif karşılaştırma

### Raporlama

- Stok değeri raporu
- Hareket raporları
- Düşük stok raporu
- Excel/PDF export

### Entegrasyonlar

- **UPH**: Proje malzeme listesi
- **Weave**: Komponent stok durumu
- **T-SA**: AI stok analizi

---

## 🛠️ Teknoloji Yığını

| Kategori  | Teknoloji          |
| --------- | ------------------ |
| Framework | Next.js 16         |
| Dil       | TypeScript 5       |
| State     | Zustand (Slices)   |
| UI        | Shadcn/ui          |
| Stil      | Tailwind CSS 4     |
| Backend   | Firebase Firestore |
| Auth      | Firebase Auth      |
| Storage   | Firebase Storage   |

---

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- pnpm

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/your-repo/ENV-I.git
cd ENV-I-main

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
```

---

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   └── [locale]/
│       └── (main)/
│           ├── audit-log/
│           ├── catalog/
│           ├── consumables/
│           ├── dashboard/
│           ├── discontinued/
│           ├── equipment/
│           ├── export/
│           ├── inventory/
│           ├── orders/
│           ├── physical-count/
│           ├── projects/
│           ├── proposals/
│           ├── purchases/
│           ├── reports/
│           ├── settings/
│           ├── suppliers/
│           ├── transfers/
│           └── warehouse-map/
├── components/             # React bileşenleri
├── stores/                 # Zustand store'ları
│   └── slices/
│       ├── product-slice.ts
│       ├── order-slice.ts
│       └── common-slice.ts
├── lib/                    # Yardımcı fonksiyonlar
└── types/                  # TypeScript tip tanımları
```

---

## 🎨 Ekran Görüntüleri

### Dashboard

![Dashboard](https://via.placeholder.com/800x450?text=Dashboard)

### Ürün Listesi

![Products](https://via.placeholder.com/800x450?text=Product+List)

### Depo Haritası

![Warehouse](https://via.placeholder.com/800x450?text=Warehouse+Map)

---

## 📊 Store Yapısı

### ProductSlice

```typescript
interface ProductSlice {
  products: Product[];
  equipment: Equipment[];
  consumables: Consumable[];

  fetchProducts: () => void;
  addProduct: (data) => Promise<void>;
  updateProduct: (id, data) => Promise<void>;
  deleteProduct: (id) => Promise<void>;

  searchProducts: (term) => Promise<void>;
  autoCategorizeAllProducts: () => Promise<void>;
}
```

### OrderSlice

```typescript
interface OrderSlice {
  orders: Order[];
  proposals: Proposal[];

  fetchOrders: () => void;
  addOrder: (data) => Promise<void>;

  fetchProposals: () => void;
  addProposal: (data, file) => Promise<void>;
}
```

### CommonSlice

```typescript
interface CommonSlice {
  logs: AuditLog[];
  settings: Settings;
  warehouses: Warehouse[];

  fetchLogs: () => void;
  fetchSettings: () => Promise<void>;
  addWarehouse: (data) => Promise<void>;
}
```

---

## 🏗️ Depo Hiyerarşisi

```
Şirket
└── Depo (Warehouse)
    ├── Zon A (Zone)
    │   ├── Raf A1 (Shelf)
    │   │   └── Ürünler
    │   ├── Raf A2
    │   └── Raf A3
    ├── Zon B
    │   ├── Raf B1
    │   └── Raf B2
    └── Zon C
        └── Raf C1
```

---

## 🔗 T-Ecosystem Entegrasyonu

ENV-I, T-Ecosystem'de stok yönetimi sağlar:

```
┌─────────┐
│   UPH   │◄───── Proje malzeme listesi
└────┬────┘
     │
┌────▼────┐
│  ENV-I  │◄───── Stok yönetimi (Merkez)
└────┬────┘
     │
┌────▼────┐
│  Weave  │◄───── Komponent stok durumu
└─────────┘
     │
┌────▼────┐
│  T-SA   │◄───── AI stok analizi
└─────────┘
```

---

## 📄 Lisans

Bu proje özel lisans altındadır.

---

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Push yapın
5. Pull Request açın

---

<div align="center">

**T-Ecosystem** tarafından ❤️ ile geliştirildi

</div>
