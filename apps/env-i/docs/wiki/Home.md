# ENV-I Wiki

ENV-I (Inventory Intelligence), TEK Ekosistemi'nin merkezi envanter yönetim sistemidir.

## 📚 İçindekiler

- [Mimari Genel Bakış](#mimari-genel-bakış)
- [Özellikler](#özellikler)
- [API Referansı](#api-referansı)
- [Ekosistem Entegrasyonu](#ekosistem-entegrasyonu)
- [Geliştirici Kılavuzu](#geliştirici-kılavuzu)

---

## Mimari Genel Bakış

### Teknoloji Yığını

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Next.js 15  │  │  Tailwind    │  │  shadcn/ui   │       │
│  │  App Router  │  │  Neon Glass  │  │  Components  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                      State Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Zustand (data-store.ts)                 │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────┐ │   │
│  │  │Products│ │Categor.│ │Warehou.│ │Audit Logs     │ │   │
│  │  │ Slice  │ │ Slice  │ │ Slice  │ │ Slice         │ │   │
│  │  └────────┘ └────────┘ └────────┘ └────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Data Access Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Repositories (lib/repositories/)           │   │
│  │  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │ productRepo  │  │ categoryRepo │                  │   │
│  │  └──────────────┘  └──────────────┘                  │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                       Backend                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Firestore   │  │    Auth      │  │   Storage    │       │
│  │   (NoSQL)    │  │  (Firebase)  │  │  (Images)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Dosya Yapısı

| Dizin                      | Açıklama                                        |
| -------------------------- | ----------------------------------------------- |
| `src/app/[locale]/(main)/` | Sayfa rotaları (dashboard, inventory, settings) |
| `src/components/`          | React bileşenleri                               |
| `src/stores/`              | Zustand state yönetimi                          |
| `src/lib/repositories/`    | Firebase veri erişim katmanı                    |

---

## Özellikler

### 📦 Ürün Yönetimi

- **CRUD İşlemleri**: Ürün ekleme, düzenleme, silme
- **Alanlar**: SKU, isim, kategori, fiyat, stok, depo lokasyonu
- **Görüntü Yükleme**: Firebase Storage'a otomatik yükleme
- **Barkod/QR**: `qrcode` kütüphanesi ile etiket oluşturma

### 🔍 Arama ve Filtreleme

- **Bulanık Arama**: Fuse.js ile yazım hatası toleranslı arama
- **Kategori Filtresi**: Çoklu kategori seçimi
- **Depo Filtresi**: Lokasyon bazlı filtreleme
- **Stok Durumu**: Kritik, düşük, normal stok filtreleri

### 📊 Dashboard Metrikleri

| Metrik         | Açıklama                            |
| -------------- | ----------------------------------- |
| Toplam Ürün    | Envanterdeki tüm ürün sayısı        |
| Toplam Değer   | Stok × Fiyat toplamı                |
| Kritik Stok    | Minimum seviyenin altındaki ürünler |
| Son Hareketler | Son 24 saatteki stok değişiklikleri |

### 📝 Denetim Günlüğü (Audit Log)

Tüm stok hareketleri kaydedilir:

- Stok girişi/çıkışı
- Fiyat değişiklikleri
- Kullanıcı eylemleri
- Zaman damgası

---

## API Referansı

### Store Metodları

```typescript
// Ürün İşlemleri
addProduct(product: Product): Promise<void>
updateProduct(id: string, updates: Partial<Product>): Promise<void>
deleteProduct(id: string): Promise<void>

// Arama
searchProducts(query: string): Product[]
filterByCategory(categoryId: string): Product[]

// Stok İşlemleri
adjustStock(id: string, quantity: number): Promise<void>
transferStock(fromId: string, toId: string, qty: number): Promise<void>
```

### Repository Katmanı

```typescript
// lib/repositories/productRepository.ts
getAll(): Promise<Product[]>
getById(id: string): Promise<Product | null>
create(data: CreateProductDTO): Promise<string>
update(id: string, data: UpdateProductDTO): Promise<void>
delete(id: string): Promise<void>
```

---

## Ekosistem Entegrasyonu

### T-Weave → ENV-I

Weave'den tasarım gönderildiğinde:

1. Şablon görüntüsü Firebase Storage'a yüklenir
2. Yeni ürün kaydı oluşturulur (`weaveTemplateId` ile)
3. Ürün detaylarında tasarım önizlemesi gösterilir

### ENV-I → T-HUB (UPH)

UPH proje malzemelerine bağlantı:

1. UPH'dan ürün aranır
2. `envProductId` ile bağlantı kurulur
3. Fiyat ve stok bilgisi UPH'a senkronize edilir

---

## Geliştirici Kılavuzu

### Yeni Özellik Ekleme

1. **Store Slice Oluştur**: `stores/slices/` altında yeni slice
2. **Repository Ekle**: `lib/repositories/` altında veri erişimi
3. **Bileşen Yaz**: `components/` altında UI
4. **Rota Ekle**: `app/[locale]/(main)/` altında sayfa

### Stil Kuralları

```css
/* Neon Glass Teması */
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Neon Vurgular */
.neon-glow {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}
```

### Test

```bash
pnpm test          # Unit testleri çalıştır
pnpm lint          # Lint kontrolü
pnpm build         # Production build
```
