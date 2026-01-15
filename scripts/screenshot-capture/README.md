# T-Ecosystem Screenshot Capture Tool

Her T-Ecosystem uygulamasının tüm sayfalarını, modallarını ve ekranlarını otomatik olarak yakalayan Playwright tabanlı script.

## 🚀 Kurulum

```bash
cd tek-ui/scripts/screenshot-capture
npm install
npx playwright install chromium
```

## 📸 Kullanım

### Tüm Uygulamaları Yakala

```bash
pnpm run capture
```

### Belirli Bir Uygulamayı Yakala

```bash
# ENV-I
pnpm run capture:env-i

# UPH
pnpm run capture:uph

# T-SA
pnpm run capture:t-sa

# Renderci
pnpm run capture:renderci

# Weave
pnpm run capture:weave

# T-Market
pnpm run capture:t-market
```

## 📁 Çıktı Yapısı

```
screenshots/
├── env-i/
│   ├── pages/
│   │   ├── login.png
│   │   ├── dashboard.png
│   │   ├── inventory.png
│   │   └── ...
│   └── modals/
│       └── ...
├── uph/
│   ├── pages/
│   └── modals/
├── t-sa/
├── renderci/
├── weave/
└── t-market/
```

## ⚙️ Yapılandırma

`capture.ts` dosyasındaki `APP_CONFIGS` objesini düzenleyerek:

- Yeni sayfalar ekleyebilirsiniz
- Modal tanımları yapabilirsiniz
- Custom bekleme koşulları ekleyebilirsiniz

### Sayfa Ekleme Örneği

```typescript
{
  path: "/tr/new-page",
  name: "new-page",
  waitFor: ".page-content",  // Opsiyonel: Bekleme selector'ı
  modals: [
    {
      name: "add-item",
      trigger: "[data-testid='add-button']",
      waitFor: ".modal-content"
    }
  ]
}
```

## 🛠️ Gereksinimler

- Node.js 18+
- pnpm
- Chromium (Playwright tarafından indirilir)

## 📌 Notlar

1. **Dev Server**: Script, belirtilen uygulamanın dev server'ını otomatik başlatır. Eğer server zaten çalışıyorsa, mevcut olanı kullanır.

2. **Auth**: Login gerektiren sayfalar için `skipAuth: true` işaretleyebilirsiniz.

3. **Viewport**: Varsayılan olarak 1920x1080 çözünürlükte screenshot alınır.

4. **Dil**: Screenshots Türkçe locale ile alınır (`tr-TR`).

## 🔧 Troubleshooting

**Server başlamıyor:**

- İlgili uygulamanın `pnpm dev` komutuyla çalıştığından emin olun
- Port çakışmalarını kontrol edin

**Screenshot alınamıyor:**

- Sayfa yükleme süresini artırın
- waitFor selector'ların doğru olduğunu kontrol edin
