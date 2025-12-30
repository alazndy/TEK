import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Initialize Firestore with persistent cache settings (modern approach)
let db: Firestore;

try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  
  // Enable offline persistence (legacy method fallback or explicit enable if needed for some SDK versions, 
  // but initializeFirestore with persistentLocalCache is usually enough for modern SDKs. 
  // However, enableIndexedDbPersistence is explicit.)
  // Note: initializeFirestore with persistentLocalCache handles it in modular SDK 9+. 
  // adding explicit log to confirm.
} catch (e) {
  // If Firestore is already initialized (e.g. during hot reload), use existing instance
  console.log("Firestore already initialized, using existing instance");
  db = getFirestore(app);
}

const auth = getAuth(app);


export { app, db, auth };
