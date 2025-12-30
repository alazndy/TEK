# T-HUB Wiki

Hoş geldiniz! Bu wiki, T-HUB (Unified Project Hub) uygulamasının kapsamlı dokümantasyonunu içerir.

## 📚 İçindekiler

- [[Mimari|Architecture]]
- [[Proje Yönetimi|Project-Management]]
- [[Mühendislik (ECM)|Engineering-ECM]]
- [[Risk Yönetimi|Risk-Management]]
- [[Güvenlik|Security]]
- [[API Referansı|API-Reference]]

---

## Hızlı Başlangıç

```bash
git clone https://github.com/alazndy/UPH.git
cd UPH-main
pnpm install
pnpm dev
```

Uygulama `http://localhost:3001` adresinde çalışacak.

---

## Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────┐
│                          T-HUB Frontend                              │
│  Dashboard │ Projects │ Kanban │ Analytics │ Engineering │ Risk     │
├─────────────────────────────────────────────────────────────────────┤
│                        Kurumsal Modüller                             │
│     ECM (ECR/ECO) │ Resource Planning │ Risk Intelligence │ SOC 2   │
├─────────────────────────────────────────────────────────────────────┤
│                        State Management                              │
│  project-store │ kanban-store │ ecm-store │ risk-store │ audit-store│
├─────────────────────────────────────────────────────────────────────┤
│                          Backend                                     │
│     Firestore │ Firebase Auth │ Firebase Storage │ IndexedDB        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Modüller

### 📊 Proje Yönetimi

- Görev atama ve takip
- Gantt zaman çizelgesi
- Finansal analiz (BOM, karlılık)

### 🔧 Mühendislik (ECM)

- ECR (Engineering Change Request)
- ECO (Engineering Change Order)
- Revizyon takibi

### ⚠️ Risk Yönetimi

- RAID Log
- 5x5 Risk Matrisi
- EVM Metrikleri (CPI, SPI)

### 🔒 Güvenlik (SOC 2)

- RBAC (6 rol, 12 yetki)
- Değiştirilemez Audit Log
- Görevler Ayrılığı (SoD)

### 📅 Kaynak Planlama

- Kapasite Isı Haritası
- Darboğaz Tespiti
- Kaynak Dengeleme
