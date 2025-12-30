const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ecosystem Logo URLs (Mocking public URLs or using local paths as placeholders)
// In a real scenario, these would be uploaded to Firebase Storage.
// Since we are running locally, we can point to the local public folder paths if the dev server serves them.
const UPH_LOGO = "/ecosystem-logo.png";
const ENVI_LOGO = "http://localhost:3001/ecosystem-logo.png";
const WEAVE_LOGO = "http://localhost:3004/ecosystem-logo.png";

async function updateProjectLogos() {
    console.log("Updating project logos in UPH...");
    const snapshot = await getDocs(collection(db, 'projects'));
    
    for (const projectDoc of snapshot.docs) {
        const data = projectDoc.data();
        let newLogo = UPH_LOGO; // Default
        
        // Logical assignment based on project name or tags if possible
        const name = data.name.toLowerCase();
        if (name.includes('env') || name.includes('envanter') || name.includes('stock')) {
            newLogo = ENVI_LOGO;
        } else if (name.includes('weave') || name.includes('design') || name.includes('çizim')) {
            newLogo = WEAVE_LOGO;
        }

        console.log(`Updating project "${data.name}" with logo: ${newLogo}`);
        await updateDoc(doc(db, 'projects', projectDoc.id), {
            logoUrl: newLogo
        });
    }
    console.log("All project logos updated successfully.");
}

updateProjectLogos().catch(console.error);
