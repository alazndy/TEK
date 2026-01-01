
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "envanterim-g5j8h.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "envanterim-g5j8h",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "envanterim-g5j8h.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "399978841070",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:399978841070:web:cbb4e1a9386ad73d9844ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use env var or default to the previously hardcoded ID for backward compat during migration
const userId = process.env.ADMIN_USER_ID || "Ib7zSzUA2ZcEAbxWdOn5kOPHOJD2";

const repos = [
  { name: "UPH", full_name: "alazndy/UPH", description: "Unified Project Hub", language: "TypeScript" },
  { name: "ADCWEB", full_name: "alazndy/ADCWEB", description: "websitesi", language: "HTML" },
  { name: "Pro-gect", full_name: "alazndy/Pro-gect", description: "", language: "TypeScript" },
  { name: "Akort-Artizan", full_name: "alazndy/Akort-Artizan", description: "ahdi yine baştan", language: "TypeScript" },
  { name: "tekelserver", full_name: "alazndy/tekelserver", description: "", language: "JavaScript" },
  { name: "Prolog", full_name: "alazndy/Prolog", description: "Kitap arama Motoru", language: "TypeScript" },
  { name: "Weave", full_name: "alazndy/Weave", description: "", language: "HTML" },
  { name: "Pr-M", full_name: "alazndy/Pr-M", description: "", language: "TypeScript" },
  { name: "Content", full_name: "alazndy/Content", description: "film dizi motoru", language: "TypeScript" },
  { name: "PROGECT", full_name: "alazndy/PROGECT", description: "PROGECT", language: "TypeScript" },
  { name: "PR-HUB", full_name: "alazndy/PR-HUB", description: "", language: "None" },
  { name: "parf-mistan", full_name: "alazndy/parf-mistan", description: "", language: "HTML" },
  { name: "ADC-ENV-SYS", full_name: "alazndy/ADC-ENV-SYS", description: "", language: "TypeScript" },
  { name: "momopoly", full_name: "alazndy/momopoly", description: "kasa ve tapu managment", language: "TypeScript" },
  { name: "geotales", full_name: "alazndy/geotales", description: "", language: "None" },
  { name: "ESP-Car-Remote", full_name: "alazndy/ESP-Car-Remote", description: "", language: "C++" },
  { name: "ADC-web", full_name: "alazndy/ADC-web", description: "", language: "HTML" },
  { name: "bs9100tsim", full_name: "alazndy/bs9100tsim", description: "", language: "TypeScript" },
  { name: "alazndy", full_name: "alazndy/alazndy", description: "", language: "None" },
  { name: "inksim", full_name: "alazndy/inksim", description: "ink simulation for akort", language: "TypeScript" },
  { name: "GTab", full_name: "alazndy/GTab", description: "Custom New/Home Tab", language: "TypeScript" },
  { name: "Routineless", full_name: "alazndy/Routineless", description: "", language: "None" },
  { name: "ENV-I", full_name: "alazndy/ENV-I", description: "", language: "TypeScript" },
  { name: "akort-reactnat-ve", full_name: "alazndy/akort-reactnat-ve", description: "", language: "None" },
  { name: "Akortv2", full_name: "alazndy/Akortv2", description: "", language: "TypeScript" },
  { name: "waveformix", full_name: "alazndy/waveformix", description: "fg", language: "TypeScript" },
  { name: "Akort5", full_name: "alazndy/Akort5", description: "ahdi yine baştan", language: "TypeScript" },
  { name: "RCPS-Sim", full_name: "alazndy/RCPS-Sim", description: "sim", language: "TypeScript" },
  { name: "sartnnametest", full_name: "alazndy/sartnnametest", description: "", language: "TypeScript" },
  { name: "tech-schem", full_name: "alazndy/tech-schem", description: "dd", language: "TypeScript" },
  { name: "akort", full_name: "alazndy/akort", description: "", language: "TypeScript" },
  { name: "RCPS", full_name: "alazndy/RCPS", description: "", language: "C++" },
  { name: "esp32flutter", full_name: "alazndy/esp32flutter", description: "", language: "Dart" },
  { name: "ESP-Car-Remote-Simulator", full_name: "alazndy/ESP-Car-Remote-Simulator", description: "", language: "Python" }
];

async function importRepos() {
  const projectsRef = collection(db, 'projects');
  
  for (const repo of repos) {
    const q = query(projectsRef, where("githubRepo", "==", repo.full_name));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Importing ${repo.name}...`);
      await addDoc(projectsRef, {
        name: repo.name,
        description: repo.description || `GitHub Repository: ${repo.full_name}`,
        githubRepo: repo.full_name,
        status: "Active",
        priority: "Medium",
        budget: 0,
        spent: 0,
        manager: "Goktug TURHAN",
        startDate: new Date().toISOString().split('T')[0],
        userId: userId,
        completionPercentage: 0,
        tags: [repo.language || "Unknown"],
        files: [],
        githubSyncEnabled: true,
        lastGithubSync: new Date().toISOString()
      });
    } else {
      console.log(`Skipping ${repo.name} (already exists)`);
    }
  }
  console.log('Final Import finished!');
}

importRepos().catch(console.error);
