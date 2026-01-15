
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";

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

async function wipeCollection(colName: string) {
    console.log(`Clearing '${colName}' collection...`);
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.size === 0) {
        console.log(`'${colName}' is already empty.`);
        return;
    }

    console.log(`Found ${snapshot.size} documents in '${colName}'. Deleting...`);
    
    // Batch delete
    const batch = writeBatch(db);
    let count = 0;
    let totalDeleted = 0;

    for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        count++;
        totalDeleted++;
        
        if (count >= 400) {
            await batch.commit();
            console.log(`Deleted 400 items...`);
            count = 0;
        }
    }
    
    if (count > 0) {
        await batch.commit();
    }
    console.log(`✅ '${colName}' cleared. Total deleted: ${totalDeleted}`);
}

async function wipeAll() {
    try {
        console.log("⚠️ STARTING DATABASE WIPE ⚠️");
        await wipeCollection("products");
        await wipeCollection("equipment");
        await wipeCollection("consumables");
        console.log("🏁 Database Wipe Completed.");
    } catch (error) {
        console.error("❌ Error wiping database:", error);
    }
}

wipeAll();
