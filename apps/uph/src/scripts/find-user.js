
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

async function findUserId() {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  if (querySnapshot.empty) {
    console.log('No projects found.');
    return;
  }
  const firstProject = querySnapshot.docs[0].data();
  console.log('USER_ID_FOUND:', firstProject.userId);
}

findUserId().catch(console.error);
