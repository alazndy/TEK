
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function listProjects() {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  const projects = querySnapshot.docs.map(doc => ({
    id: doc.id,
    githubRepo: doc.data().githubRepo,
    name: doc.data().name
  })).filter(p => p.githubRepo);
  
  console.log('PROJECT_LIST_START');
  console.log(JSON.stringify(projects, null, 2));
  console.log('PROJECT_LIST_END');
}

listProjects().catch(console.error);
