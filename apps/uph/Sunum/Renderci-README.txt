# Rendercı Muhittin - 3D Görselleştirme Motoru

<div align="center">

![Renderci Logo](https://via.placeholder.com/150?text=Renderci)

**AI Destekli Teknik Görselleştirme Platformu**

[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js)](https://threejs.org/)

[Demo](#) • [Dokümantasyon](#) • [Kurulum](#kurulum) • [Özellikler](#özellikler)

</div>

---

## 📖 Hakkında

Rendercı Muhittin, teknik çizimlerden ve 3D modellerden yüksek kaliteli görsel renderlar üreten AI destekli bir görselleştirme motorudur. T-Ecosystem ailesinin render uygulamasıdır.

### Neden Rendercı Muhittin?

- 🎨 **AI Destekli Render**: Prompt ile görsel iyileştirme
- 🔮 **3D Model Desteği**: GLB, STEP, DXF dosyaları
- 🖼️ **Stil Presetleri**: Hazır profesyonel stiller
- ✨ **Katman Yönetimi**: Çoklu katmanlı düzenleme
- 🔗 **Ekosistem Entegrasyonu**: UPH, Weave ile bağlantı

---

## ✨ Özellikler

### Görsel Yükleme

- Desteklenen formatlar: JPG, PNG, WEBP, GIF
- Sürükle-bırak desteği
- Clipboard'dan yapıştırma
- URL'den yükleme

### 3D Model Desteği

- **GLB/GLTF**: Web optimized 3D
- **STEP**: CAD formatı
- **DXF**: 2D çizim
- **OBJ**: Universal 3D

### 3D Viewer

- Orbit, Pan, Zoom kontrolleri
- Solid, Wireframe, X-Ray görünümleri
- HDRI ortam aydınlatması
- Screenshot ve animasyon capture

### AI Render Motoru

- Google Gemini Vision API
- Prompt bazlı iyileştirme
- İteratif düzeltme
- Çoklu varyasyon üretimi

### Stil Presetleri

- **Photorealistic**: Gerçekçi render
- **Studio Lighting**: Stüdyo ortamı
- **Outdoor Scene**: Dış mekan
- **Technical Drawing**: Teknik çizim
- **Custom**: Özel stil

### Katman Yönetimi

- Çoklu katman desteği
- Katman sıralama
- Görünürlük kontrolü
- Blend modları

### Materyal Paleti

- Metal, Plastik, Cam
- Ahşap, Kumaş
- Özel materyal tanımlama

### Export

- Yüksek çözünürlük (4K)
- Format seçimi (PNG, JPG, WEBP)
- Şeffaf arka plan desteği

### Prompt Kütüphanesi

- Kayıtlı promptlar
- Kategorize edilmiş
- Hızlı erişim

### Galeri

- Render geçmişi
- Kayıtlı görseller
- Favoriler

### Entegrasyonlar

- **UPH**: Proje görselleri kaydetme
- **Weave**: PCB/3D model import

---

## 🛠️ Teknoloji Yığını

| Kategori   | Teknoloji                    |
| ---------- | ---------------------------- |
| Build Tool | Vite 5                       |
| Framework  | React 19                     |
| Dil        | TypeScript 5                 |
| 3D Engine  | Three.js / React Three Fiber |
| AI         | Google Gemini Vision         |
| Stil       | Tailwind CSS 4               |
| Animasyon  | Framer Motion                |

---

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- pnpm

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/your-repo/Renderci.git
cd Renderci/code

# Bağımlılıkları yükle
pnpm install

# Geliştirme sunucusunu başlat
pnpm dev
```

### Ortam Değişkenleri

`.env` dosyası oluşturun:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 📁 Proje Yapısı

```
code/
├── components/
│   ├── ThreeDViewer.tsx        # 3D model görüntüleme
│   ├── ImageModal.tsx          # Görsel düzenleme
│   ├── ImageUploader.tsx       # Görsel yükleme
│   ├── InputPanel.tsx          # Prompt/stil girişi
│   ├── ResultDisplay.tsx       # Render sonucu
│   ├── ResultActions.tsx       # İndirme/paylaşma
│   ├── StylePresetSelector.tsx # Stil seçimi
│   ├── MaterialPalette.tsx     # Materyal seçimi
│   ├── GalleryModal.tsx        # Galeri
│   ├── PromptLibraryModal.tsx  # Prompt kütüphanesi
│   ├── CompareSlider.tsx       # Önce/sonra
│   ├── NavigationControls.tsx  # 3D kontroller
│   ├── WelcomeScreen.tsx       # Karşılama
│   └── ui/                     # UI bileşenleri
├── hooks/
│   └── useAppState.ts          # Ana state hook
├── App.tsx                     # Ana uygulama
└── main.tsx                    # Entry point
```

---

## 🎨 AI Render Pipeline

```
┌─────────────────┐
│  KAYNAK GİRİŞİ  │
│  (Görsel/3D)    │
└────────┬────────┘
         ▼
┌─────────────────┐
│   ÖNIŞLEME      │
│ • Görsel analiz │
│ • Renk çıkarımı │
└────────┬────────┘
         ▼
┌─────────────────┐
│  STİL UYGULAMA  │
│ • Preset seçimi │
│ • Özel prompt   │
└────────┬────────┘
         ▼
┌─────────────────┐
│   AI RENDER     │
│ • Gemini Vision │
│ • İteratif      │
└────────┬────────┘
         ▼
┌─────────────────┐
│     ÇIKTI       │
│ • HD Export     │
│ • UPH kaydet    │
└─────────────────┘
```

---

## 🖼️ Ekran Görünümü

```
┌─────────────────────────────────────────────────────────┐
│  [Rendercı Muhittin]              [Yeni] [Galeri] [⚙]  │
├─────────────────────────┬───────────────────────────────┤
│                         │                               │
│  ┌───────────────────┐  │  ┌───────────────────────┐   │
│  │ KAYNAK GÖRSEL     │  │  │ RENDER SONUCU         │   │
│  │ veya 3D MODEL     │  │  │ (Büyük Görüntü)       │   │
│  └───────────────────┘  │  └───────────────────────┘   │
│                         │                               │
│  [Görsel Yükle] [3D]    │  [← Önceki] [→ Sonraki]      │
│                         │                               │
│  Stil Presetleri:       │  [İndir HD] [UPH'ye Kaydet]  │
│  ○ Photorealistic       │                               │
│  ○ Studio               │  ┌───────────────────────┐   │
│  ○ Outdoor              │  │ Geçmiş Thumbnails     │   │
│                         │  │ [■] [■] [■] [■]       │   │
│  Prompt: [............] │  └───────────────────────┘   │
│                         │                               │
│  [★ RENDER BAŞLAT]      │                               │
└─────────────────────────┴───────────────────────────────┘
```

---

## 🔗 T-Ecosystem Entegrasyonu

```
┌─────────┐
│  Weave  │◄───── PCB/3D model export
└────┬────┘
     │
┌────▼────┐
│Renderci │ ─────► Görselleştirme (Merkez)
└────┬────┘
     │
┌────▼────┐
│   UPH   │◄───── Proje görselleri kaydetme
└─────────┘
```

---

## 📄 Lisans

Bu proje özel lisans altındadır.

---

<div align="center">

**T-Ecosystem** tarafından ❤️ ile geliştirildi

</div>
