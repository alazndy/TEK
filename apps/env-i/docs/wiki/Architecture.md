# ENV-I Architecture

ENV-I is built on a modern, scalable stack designed for speed and state-of-the-art UI/UX.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS with `shadcn/ui`.
- **State Management**: Zustand (Modular slice-based store).
- **Backend**: Firebase (Firestore, Auth, Storage).
- **Internationalization**: `next-intl` (TR/EN).

## 📂 Design Patterns

- **Repository Pattern**: Data access is abstracted behind repositories located in `src/lib/repositories/`. This ensures a clean separation between the UI and the data source.
- **Modular Stores**: Zustand stores are divided into logical slices for better maintainability.
- **Neon Glass UI**: A custom design system implemented primarily through Tailwind configuration and CSS variables in `globals.css`.

## 🏗️ Folder Structure

- `src/app/`: Primary routing and page layouts.
- `src/components/`: Reusable UI elements, categorized by feature.
- `src/lib/`: Core logic, Firebase config, and data repositories.
- `src/stores/`: Global state management.
