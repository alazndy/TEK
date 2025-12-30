# Getting Started with T-HUB (UPH)

Setting up T-HUB for local development.

## 🛠️ Prerequisites

- **Node.js**: v18+
- **pnpm**: High-performance package manager.
- **Firebase Project**: Firestore, Auth, and Storage enabled.
- **Google Cloud Console**: API keys for Google Drive and potentially GitHub.

## 🚀 Setup Steps

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd UPH-main
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   # Google Drive / API configuration
   # ... (add as needed from firebase-env-template.txt)
   ```

4. **Run development server**:
   ```bash
   pnpm dev
   ```
   Access at [http://localhost:3002](http://localhost:3002).

## 🧪 Testing

- **Jest**: `pnpm test`
- **Playwright**: `pnpm exec playwright test`
