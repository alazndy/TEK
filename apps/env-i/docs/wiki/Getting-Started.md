# Getting Started with ENV-I

Follow these steps to set up the development environment for ENV-I.

## 🛠️ Prerequisites

- **Node.js**: v18 or higher.
- **pnpm**: Recommended package manager.
- **Firebase Account**: To set up a project and obtain configuration keys.

## 🚀 Setup Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/alazndy/ENV-I.git
   cd ENV-I-main
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**:
   ```bash
   pnpm dev
   ```
   Access the app at [http://localhost:3001](http://localhost:3001).

## 🧪 Running Tests

- **Vitest**: `pnpm test`
- **Playwright (E2E)**: `pnpm exec playwright test`
