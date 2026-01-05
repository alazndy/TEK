import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
// Check if config is valid (has apiKey)
const isConfigValid = !!firebaseConfig?.apiKey;

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (isConfigValid) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    // If Firestore is already initialized (e.g. during hot reload), use existing instance
    console.log("Firestore already initialized, using existing instance");
    db = getFirestore(app);
  }

  auth = getAuth(app);
} else {
  console.warn("Firebase config missing or invalid. Using mock objects for build.");
  // Basic mocks to prevent build crashes
  app = {} as FirebaseApp;
  db = {
    type: 'firestore',
    app: {} as any,
  } as unknown as Firestore;
  auth = {
     currentUser: null,
  } as unknown as Auth;
}

export { app, db, auth };
