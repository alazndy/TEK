
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: "envanterim-g5j8h"
        });
        console.log("Firebase Admin initialized successfully.");
    } catch (error) {
        console.error("❌ Failed to initialize Firebase Admin.");
        console.error("Please ensure you are authenticated.");
        console.error("Run: 'gcloud auth application-default login' in your terminal.");
        console.error("OR set GOOGLE_APPLICATION_CREDENTIALS to your service account key path.");
        process.exit(1);
    }
}

const db = admin.firestore();

const CATALOG_FILE = path.join(__dirname, 'katalog.csv');

async function parseCatalog() {
    console.log(`Reading catalog from: ${CATALOG_FILE}`);
    
    if (!fs.existsSync(CATALOG_FILE)) {
        console.error(`❌ Catalog file not found at ${CATALOG_FILE}`);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(CATALOG_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const modelToPartNo = new Map();

    let isFirstLine = true;
    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }
        if (!line.trim()) continue;

        const parts = line.split(';');
        if (parts.length < 3) continue;

        const partNo = parts[1]?.trim();
        const model = parts[2]?.trim();

        if (partNo && model) {
            const cleanModel = model.replace(/^"|"$/g, '');
            const cleanPartNo = partNo.replace(/^"|"$/g, '');
            modelToPartNo.set(cleanModel, cleanPartNo);
        }
    }
    return modelToPartNo;
}

async function updateProducts() {
    try {
        const modelToPartNo = await parseCatalog();
        console.log(`Loaded ${modelToPartNo.size} items from catalog.`);

        console.log("Fetching products from Firestore...");
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();
        
        console.log(`Found ${snapshot.size} products in database.`);

        let updatedCount = 0;
        let batch = db.batch();
        let batchCount = 0;
        const BATCH_LIMIT = 400;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            const stock = Number(data.stock) || 0;
            if (stock <= 0) continue;

            let updates = {};
            let needsUpdate = false;

            if (data.manufacturer !== 'Brigade') {
                updates.manufacturer = 'Brigade';
                needsUpdate = true;
            }

            if (data.name) {
                const catalogPartNo = modelToPartNo.get(data.name);
                if (catalogPartNo && data.parcode !== catalogPartNo) {
                    updates.parcode = catalogPartNo;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                const docRef = productsRef.doc(doc.id);
                batch.update(docRef, updates);
                updatedCount++;
                batchCount++;

                if (batchCount >= BATCH_LIMIT) {
                    await batch.commit();
                    console.log(`Committed batch of ${batchCount} updates...`);
                    batch = db.batch();
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} updates.`);
        }

        console.log(`\n✅ Migration Complete.`);
        console.log(`Total Products Updated: ${updatedCount}`);

    } catch (error) {
        console.error("❌ Fatal Error during migration:", error);
    }
}

updateProducts();
