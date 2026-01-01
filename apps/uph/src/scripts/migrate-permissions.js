
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "envanterim-g5j8h.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "envanterim-g5j8h",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "envanterim-g5j8h.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "399978841070",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:399978841070:web:cbb4e1a9386ad73d9844ff"
};

// NOTE: This script needs to run in an environment where it can bypass rules (Admin SDK) 
// OR you must temporarily relax Firestore rules to allow updates.
// OR you must sign in as the owner of the documents.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePermissions() {
  console.log("Starting permissions migration...");
  const projectsRef = collection(db, 'projects');
  const snapshot = await getDocs(projectsRef);

  let updatedCount = 0;

  for (const projectDoc of snapshot.docs) {
    const data = projectDoc.data();
    
    // Check if members array exists
    if (!data.members || !Array.isArray(data.members)) {
      console.log(`Migrating project: ${data.name} (${projectDoc.id})`);
      
      const userId = data.userId;
      // Default members to just the owner
      // Ideally we would fetch the TeamGroup members here if teamGroupId is present
      const members = [userId];
      
      try {
        await updateDoc(doc(db, 'projects', projectDoc.id), {
          members: members
        });
        updatedCount++;
        console.log(`  -> Added members: [${members.join(', ')}]`);
      } catch (error) {
        console.error(`  -> Failed to update: ${error.message}`);
      }
    }
  }
  
  console.log(`Migration complete. Updated ${updatedCount} projects.`);
}

migratePermissions().catch(console.error);
