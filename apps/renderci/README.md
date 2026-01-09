# Renderci: Batch Visualization Engine

![Status](https://img.shields.io/badge/Status-Alpha-fuchsia) ![License](https://img.shields.io/badge/License-MIT-green) ![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Three.js%20%7C%20WebGL-E879F9)

**Renderci** is the high-performance visualization service for the **T-Ecosystem**. It brings products and designs to life using WebGL. Unlike standard 3D viewers, Renderci is built for **Automated Batch Rendering**, allowing you to generate photorealistic thumbnails for thousands of inventory items or schematics without manual intervention.

## 🚀 Capabilities & Features

### 🎥 High-Fidelity 3D Viewer

- **Interactive Preview**: Orbit, pan, and zoom around GLTF/GLB models with buttery smooth performance.
- **PBR Materials**: Physically Based Rendering for realistic metals, plastics, and glass.
- **Environment Mapping**: HDRI support for realistic reflections and lighting context.

### 🖼️ Automated Batch Rendering

- **Queue System**: Upload a list of 100+ models and let Renderci process them in the background.
- **Standardized Angles**: Define "Front", "Top", "Iso" cameras and enforce them across all renders for catalog consistency.
- **Auto-Thumbnailing**: Generate transparent PNGs for use in ENV-I and Weave UI.

### 💡 Virtual Studio

- **Lighting Presets**: Switch between "Studio Soft", "Sunlight", "Neon", and "Dark Room" setups.
- **Stage Configuration**: Add turntables, pedestals, or infinite backdrops.
- **Post-Processing**: Bloom, Ambient Occlusion (AO), and Tone Mapping adjustments.

## 🛠️ Technology Architecture

- **Core**: **React 19** + **Vite**.
- **3D Engine**: **Three.js** via **React Three Fiber (R3F)** ecosystem.
- **Controls**: **Leva** for manageable debug and scene tweaking.
- **State**: **Zustand** for render queue management.
- **Assets**: `useGLTF` and `drei` helpers for optimization.

## 📂 Project Structure

```bash
code/src/
├── components/
│   ├── Scene.tsx    # Main R3F Canvas
│   ├── Lights.tsx   # HDRI and Light setup
│   ├── Stage.tsx    # Backdrops and floor
│   └── Camera.tsx   # Controlled camera rigs
├── systems/
│   ├── Renderer.ts  # WebGL render loop configuration
│   └── Queue.ts     # Batch job processor
├── assets/          # Default models & environments
└── App.tsx          # Main entry point
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/alazndy/Renderci.git
    cd Renderci/code
    ```

2.  **Install Dependencies**

    ```bash
    pnpm install
    ```

3.  **Run Development Server**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:5174](http://localhost:5174) to access the render engine.

---

Part of the **T-Ecosystem**.
