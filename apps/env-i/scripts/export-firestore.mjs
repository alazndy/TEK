// Firestore Export Script
// Run with: node scripts/export-firestore.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyApCi8TwPdiZzRZhgFbpOCCTWk1_RD-N5g",
  authDomain: "envanterim-g5j8h.firebaseapp.com",
  projectId: "envanterim-g5j8h",
  storageBucket: "envanterim-g5j8h.firebasestorage.app",
  messagingSenderId: "399978841070",
  appId: "1:399978841070:web:cbb4e1a9386ad73d9844ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exportCollection(collectionName) {
  console.log(`Exporting ${collectionName}...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const data = [];
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });
  console.log(`  Found ${data.length} documents`);
  return data;
}

async function main() {
  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      collections: {}
    };

    // Export all inventory collections
    const collections = ['products', 'equipment', 'consumables', 'warehouses'];
    
    for (const col of collections) {
      exportData.collections[col] = await exportCollection(col);
    }

    // Write to file
    const filename = `firestore-export-${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`\n✅ Exported to ${filename}`);
    
    // Summary
    console.log('\nSummary:');
    for (const [name, data] of Object.entries(exportData.collections)) {
      console.log(`  ${name}: ${data.length} documents`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

main();
