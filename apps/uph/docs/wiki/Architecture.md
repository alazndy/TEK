# UPH Architecture & Tech Stack

UPH is a robust ERP/PMS platform built for engineering and project management.

## 🛠️ Core Technologies

- **Framework**: Next.js 15 (App Router).
- **Visualization**: `recharts` for financials, `gantt-task-react` for timelines.
- **3D Layer**: `@react-three/fiber` for DXF/CAD visualization.
- **State**: Zustand (Modular architecture).
- **Backend**: Firebase suite.

## 🎨 Visual Language

- **Unified Ecosystem Style**: Consistent with ENV-I but tailored for complex data display.
- **Responsive Layouts**: Sidebar-based navigation for desktop efficiency.

## 🏗️ Folder Structure

- `src/components/drive/`: Google Drive API logic and UI.
- `src/components/viewer/`: CAD and 3D file viewing logic.
- `src/services/`: External API integrations (Drive, GitHub).
- `src/lib/repositories/`: Data access layer following the same pattern as ENV-I.

## 🔄 State Management

Zustand stores are located in `src/stores/`. They are split into slices (e.g., `project-store`, `kanban-store`) to handle specific application modules without monolithic complexity.
