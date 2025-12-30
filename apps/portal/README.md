
# 🏗️ Rendercı Muhittin ABİ - AI Mimari Görselleştirme Asistanı

> **"Abi o kolonlar taşımaz ama renderda hallederiz..."**

Rendercı Muhittin, mimarlar, iç mimarlar ve tasarımcılar için geliştirilmiş; eskizleri, PDF paftaları ve ham 3D modelleri saniyeler içinde fotorealistik görsellere dönüştüren, **Google Gemini 2.5 ve 3.0** modellerinden güç alan yeni nesil bir web uygulamasıdır.

Bu proje, karmaşık render yazılımlarının (V-Ray, Corona, Lumion) saatler süren iş akışlarını yapay zeka ile saniyelere indirmeyi hedefler.

---

## 🌟 Temel Özellikler

### 1. Çoklu Format Desteği ve Dönüşüm
*   **Görseller:** `.jpg`, `.png`, `.webp` formatındaki eskizleri veya kolajları işler.
*   **PDF Paftalar:** `pdf.js` entegrasyonu ile vektörel PDF çizimlerini (plan, kesit) otomatik olarak yüksek çözünürlüklü görsellere çevirir ve render alır.
*   **3D Modeller:** `.obj`, `.stl` ve Rhino `.3dm` formatlarını tarayıcı tabanlı görüntüleyicide açar.

### 2. Entegre 3D Motoru (Three.js)
Uygulama, harici bir yazılıma ihtiyaç duymadan kendi içinde bir 3D görüntüleyici barındırır:
*   **Formatlar:** Rhino (`.3dm`), Standart (`.obj`, `.stl`).
*   **Gizmo Kontrolleri:** Modeli tarayıcı içinde taşıyın, döndürün ve ölçeklendirin.
*   **HDRI Işıklandırma:** Modelin detaylarını görebilmek için stüdyo ışıklandırması simülasyonu.
*   **Snapshot:** İstediğiniz açıyı yakaladığınız anda "Bu Açıyı Renderla" diyerek görüntüyü yapay zeka motoruna besler.

### 3. Google Gemini Entegrasyonu (Beyin)
Uygulama, `@google/genai` SDK'sını kullanarak en son modelleri kullanır:
*   **Standart Render:** `gemini-2.5-flash-image` (Hız ve maliyet dengesi).
*   **Ultra Detay & Upscale:** `gemini-3-pro-image-preview` (Yüksek sadakat ve 4K çıktı).
*   **Prompt Mühendisliği:** Kullanıcının seçtiği stillere (Realistik, Eskiz, Vaziyet) göre arka planda optimize edilmiş sistem talimatları (System Instructions) oluşturulur.

### 4. Profesyonel Düzenleme (Inpainting)
Render sonucunda beğenilmeyen alanlar için:
*   **Katmanlı Seçim:** Kutu veya Kement (Lasso) aracı ile alan seçimi.
*   **Çoklu Katman:** Ön plan ve arka plan için ayrı ayrı prompt girerek (örn: "Öne ağaç ekle", "Arkaya gökdelen koy") kompozit düzenleme yapabilme.

### 5. Galeri ve Yerel Depolama
*   **IndexedDB:** Tüm render geçmişiniz, promptlarınız ve galeriniz tarayıcınızın yerel veritabanında saklanır. Sayfayı yenileseniz bile çalışmalarınız kaybolmaz.

---

## 📂 Proje Yapısı ve Dosya Açıklamaları

Uygulamanın kalbi olan dosyaların ne işe yaradığının detaylı dökümü:

### Ana Yapı
*   **`index.html`**: Uygulamanın giriş noktası. Global stiller, fontlar (Outfit) ve temel CSS değişkenleri burada tanımlıdır. Arka plandaki "Deep Slate" teması ve cam (glassmorphism) efektleri buradaki CSS ile sağlanır.
*   **`App.tsx`**: Ana orkestra şefi. Tüm durum yönetimi (State Management), hangi ekranın gösterileceği (Yükleme, 3D, Sonuç) ve modalların kontrolü burada toplanır.
*   **`types.ts`**: TypeScript tip tanımları. Uygulama genelinde kullanılan veri yapılarını (Layer, StylePreset, Resolution vb.) standartlaştırır.

### Bileşenler (`components/`)
*   **`InputPanel.tsx`**: Kullanıcının prompt girdiği, stil seçtiği ve materyal eklediği sol/alt panel.
*   **`ResultDisplay.tsx`**: Render sonucunun gösterildiği ekran. "Öncesi/Sonrası" kaydırıcısı (CompareSlider) ve resim üzerindeki butonları barındırır.
*   **`ThreeDViewer.tsx`**: Three.js tabanlı 3D motoru. Dosyaları yükler, sahneye koyar, ışıklandırır ve kameradan görüntü yakalar.
*   **`ImageModal.tsx`**: Düzenleme (Inpainting) penceresi. Canvas üzerinde çizim yaparak maske oluşturur ve katmanları yönetir.
*   **`StyleReferenceUploader.tsx`**: Kullanıcının "Bu görseldeki gibi olsun" dediği referans resim yükleme alanı.
*   **`MaterialPalette.tsx`**: Hazır materyal ve atmosfer önerileri sunan (Beton, Ahşap, Gün Batımı vb.) açılır menü.
*   **`PromptLibraryModal.tsx`**: "Büyü Kitabı". Sık kullanılan promptların kaydedilip tekrar kullanıldığı kütüphane.

### Servisler (`services/`)
*   **`geminiService.ts`**: **En Kritik Dosya.** Google Gemini API ile konuşan katman.
    *   Görselleri Base64'e çevirir.
    *   Seçilen stile göre (Vaziyet, Kesit, Render) "System Instruction" yazar.
    *   Magic Upscale ve Inpainting mantığını yönetir.
*   **`storageService.ts`**: `IndexedDB` wrapper'ı. Verilerin tarayıcıda kalıcı olmasını sağlayan veritabanı işlemlerini yapar.
*   **`pdfService.ts`**: PDF dosyalarını `pdfjs-dist` kullanarak yüksek kaliteli PNG görsellerine dönüştürür. Akıllı ölçekleme (Smart Scaling) ile GPU limitlerini aşmadan maksimum kaliteyi hedefler.

### Hook'lar (`hooks/`)
*   **`useAppState.ts`**: `App.tsx`'i temiz tutmak için tüm lojik, durum yönetimi ve fonksiyonlar (Render al, Kaydet, Sıfırla vb.) bu özel hook içinde toplanmıştır. "Muhittin Abi"nin rastgele sözleri de burada tanımlıdır.

---

## 🛠️ Teknik Kurulum

Bu proje modern React (v19) ve modül tabanlı bir yapı kullanır.

### Gereksinimler
*   Node.js (Geliştirme için) veya modern bir tarayıcı (Çalıştırma için).
*   **Google AI Studio API Anahtarı:** Proje çalışırken sizden bir API anahtarı seçmenizi isteyecektir. Özellikle video ve yüksek çözünürlüklü (Gemini 3 Pro) işlemler için faturalı bir hesaba bağlı API anahtarı önerilir.

### Kurulum Adımları

1.  Repoyu klonlayın.
2.  Bağımlılıklar `index.html` içindeki `importmap` üzerinden CDN ile çekilmektedir, bu yüzden devasa bir `node_modules` klasörüne ihtiyacınız yoktur. Ancak yerel geliştirme sunucusu için:
    ```bash
    npm install
    npm run dev
    ```
3.  Uygulama açıldığında sağ üstteki veya işlem sırasındaki API anahtarı seçiciyi kullanarak Google hesabınızı bağlayın.

---

## 🎨 Stil ve Tasarım Dili

Proje, **"Cyber-Construction"** estetiğini benimser:
*   **Renk Paleti:** `#020617` (Slate 950) zemin üzerine İndigo ve Mor neon vurgular.
*   **Glassmorphism:** Paneller yarı saydamdır ve arka planı buzlu cam (blur) etkisiyle gösterir.
*   **Font:** 'Outfit', sans-serif, modern ve geometrik.
*   **Animasyonlar:** Yükleme sırasında dönen ikonlar, RGB akış efektleri ve yumuşak geçişler.

---

## 🤖 Prompt Mühendisliği Detayları

`geminiService.ts` dosyası, kullanıcı girdisini alıp modele şu rolleri atar:

*   **Realistic Mode:** "Sen üst düzey bir doku sanatçısısın. Geometriyi bozmadan malzemeleri PBR (Physically Based Rendering) mantığıyla değiştir."
*   **Site Plan (Vaziyet):** "Kesinlikle kuş bakışı (Top-down) kal. Gölgeleri 45 derece at. Peyzajı ve yolları teknik çizim standartlarında işle."
*   **Section (Kesit):** "Siyah taralı alanları (kesilen duvarlar) beton dokusuyla doldur. Odalara 2D insanlar ve mobilyalar ekle ama perspektif katma."

---

## ⚠️ Bilinen Sınırlamalar

*   **3D Dosya Boyutu:** Tarayıcı tabanlı render alındığı için çok yüksek poligonlu (100MB+) modeller tarayıcıyı yavaşlatabilir.
*   **Mobil Deneyim:** 3D görüntüleyici ve Inpainting araçları masaüstü deneyimi için optimize edilmiştir, mobilde temel özellikler çalışır ancak performans değişebilir.
*   **API Kotası:** Google Gemini API'nin ücretsiz katmanında dakika başına istek sınırı (RPM) vardır.

---

**"Müşteri kesin revize ister buna, demedi deme..." - Rendercı Muhittin**
