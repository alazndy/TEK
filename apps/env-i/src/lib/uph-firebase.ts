import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// UPH Firebase Configuration
// Requires NEXT_PUBLIC_UPH_... variables in .env.local
const uphFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_UPH_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_UPH_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_UPH_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_UPH_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_UPH_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_UPH_APP_ID
};

let uphApp: FirebaseApp;
let uphDb: Firestore;

try {
    // Check if UPH config is present
    if (!uphFirebaseConfig.apiKey) {
        console.warn("UPH Firebase Config missing. Using Mock/Empty connection.");
    } else {
        // Initialize with a unique name 'UPH' to avoid conflict with default app
        uphApp = getApps().find(app => app.name === 'UPH') || initializeApp(uphFirebaseConfig, 'UPH');
        uphDb = getFirestore(uphApp);
    }
} catch (error) {
    console.error("Error initializing UPH Firebase:", error);
}

export { uphDb };
