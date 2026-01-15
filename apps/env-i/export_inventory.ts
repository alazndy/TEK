
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase
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

async function exportToCSV() {
  try {
    console.log("Starting CSV Export...");
    
    // Fetch Collections
    console.log("Fetching Products...");
    const productsSnap = await getDocs(collection(db, "products"));
    console.log(`Fetched ${productsSnap.size} products.`);

    console.log("Fetching Equipment...");
    const equipmentSnap = await getDocs(collection(db, "equipment"));
    console.log(`Fetched ${equipmentSnap.size} equipment.`);

    console.log("Fetching Consumables...");
    const consumablesSnap = await getDocs(collection(db, "consumables"));
    console.log(`Fetched ${consumablesSnap.size} consumables.`);

    // Flatten Data
    const allItems: any[] = [];

    productsSnap.forEach(doc => {
        allItems.push({ ...doc.data(), _firestoreId: doc.id, _type: 'Product' });
    });
    equipmentSnap.forEach(doc => {
        allItems.push({ ...doc.data(), _firestoreId: doc.id, _type: 'Equipment' });
    });
    consumablesSnap.forEach(doc => {
        allItems.push({ ...doc.data(), _firestoreId: doc.id, _type: 'Consumable' });
    });

    // Define Headers (Dynamic + Fixed)
    const fixedHeaders = ['_firestoreId', '_type', 'id', 'name', 'category', 'stock', 'room', 'shelf', 'manufacturer', 'modelNumber', 'partNumber', 'barcode'];
    // Collect all other keys just in case
    const otherKeys = new Set<string>();
    allItems.forEach(item => {
        Object.keys(item).forEach(key => {
            if (!fixedHeaders.includes(key) && typeof item[key] !== 'object') {
                otherKeys.add(key);
            }
        });
    });

    const headers = [...fixedHeaders, ...Array.from(otherKeys)];
    
    // Create CSV Content
    const csvRows = [];
    csvRows.push(headers.join(',')); // Header Row

    for (const item of allItems) {
        const row = headers.map(header => {
            let val = item[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            if (typeof val === 'string') {
                val = val.replace(/"/g, '""');
                if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                    val = `"${val}"`;
                }
            }
            return val;
        });
        csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const outputPath = path.resolve('inventory_backup.csv');
    
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`✅ Export Successful! Saved to: ${outputPath}`);
    console.log(`Total Rows: ${allItems.length}`);

  } catch (error) {
    console.error("❌ Export Failed:", error);
  }
}

exportToCSV();
