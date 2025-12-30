
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

const colors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

async function migrateVisuals() {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  let index = 0;
  
  for (const projectDoc of querySnapshot.docs) {
    const data = projectDoc.data();
    const projectId = projectDoc.id;
    
    const color = colors[index % colors.length];
    const logoUrl = data.logoUrl || '/logo.png';
    
    console.log(`Updating ${data.name} with color ${color} and logo...`);
    
    await updateDoc(doc(db, 'projects', projectId), {
      color: color,
      logoUrl: logoUrl
    });
    
    index++;
  }
  console.log('Migration finished!');
}

migrateVisuals().catch(console.error);
