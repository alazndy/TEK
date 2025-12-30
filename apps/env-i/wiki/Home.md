# ENV-I Wiki

Hoş geldiniz! Bu wiki, ENV-I uygulamasının kapsamlı dokümantasyonunu içerir.

## 📚 İçindekiler

- [[Mimari|Architecture]]
- [[Özellikler|Features]]
- [[API Referansı|API-Reference]]
- [[Ekosistem|Ecosystem]]
- [[Geliştirici Kılavuzu|Developer-Guide]]

---

## Hızlı Başlangıç

```bash
git clone https://github.com/alazndy/ENV-I.git
cd ENV-I-main
pnpm install
pnpm dev
```

Uygulama `http://localhost:3001` adresinde çalışacak.

---

## Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js 15 │ Tailwind (Neon Glass) │ shadcn/ui             │
├─────────────────────────────────────────────────────────────┤
│                      State Layer                             │
│                 Zustand (data-store.ts)                      │
│     Products │ Categories │ Warehouses │ Audit Logs         │
├─────────────────────────────────────────────────────────────┤
│                   Data Access Layer                          │
│              Repositories (lib/repositories/)                │
├─────────────────────────────────────────────────────────────┤
│                       Backend                                │
│         Firestore │ Firebase Auth │ Firebase Storage         │
└─────────────────────────────────────────────────────────────┘
```

---

## Özellikler

### 📦 Ürün Yönetimi

- CRUD işlemleri
- Barkod/QR etiket oluşturma
- Firebase Storage görüntü yükleme

### 🔍 Arama

- Fuse.js bulanık arama
- Kategori/depo filtreleme

### 📊 Dashboard

- Toplam ürün/değer
- Kritik stok uyarıları
- Son hareketler

### 🔗 Ekosistem

- T-Weave tasarım senkronizasyonu
- T-HUB maliyet entegrasyonu
