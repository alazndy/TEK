
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, addDoc, getDocs } = require('firebase/firestore');

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

const enrichmentData = {
  "UPH": {
    description: "Unified Project Hub (T-HUB) is the central command center for the TEK Ecosystem, integrating project management, financial tracking, and engineering designs.",
    scope: "ERP/PMS solution for technical engineering teams.",
    tasks: [
      { title: "Integrate real-time inventory tracking from ENV-I", status: "todo", completed: false },
      { title: "Finalize Financial Dashboard with Profitability Analysis", status: "todo", completed: false },
      { title: "Optimize Gantt chart performance for large projects", status: "todo", completed: false },
      { title: "Set up mobile-responsive dashboard views", status: "todo", completed: false }
    ]
  },
  "Weave": {
    description: "Advanced Schematic Designer for system schematics, cable diagrams, and connection flows with intelligent routing.",
    scope: "Desktop schematic design tool (Electron/React).",
    tasks: [
      { title: "Improve orthogonal auto-routing for complex schematics", status: "todo", completed: false },
      { title: "Add component grouping and layer management", status: "todo", completed: false },
      { title: "Implement high-resolution SVG export", status: "todo", completed: false },
      { title: "Finalize two-way synchronization with ENV-I", status: "todo", completed: false }
    ]
  },
  "ENV-I": {
    description: "Comprehensive Inventory Management System for the TEK Ecosystem, tracking components, stocks, and procurement.",
    scope: "Centralized stock and supply chain management.",
    tasks: [
      { title: "Add bulk import functionality for component spreadsheets", status: "todo", completed: false },
      { title: "Implement low-stock notification triggers", status: "todo", completed: false },
      { title: "Set up audit logs for quantity changes", status: "todo", completed: false }
    ]
  },
  "ADCWEB": {
    description: "Public-facing website for ADC, showcasing services, projects, and ecosystem capabilities.",
    scope: "Web presence and marketing hub.",
    tasks: [
      { title: "Optimize LCP and CLS for better SEO ranking", status: "todo", completed: false },
      { title: "Implement multi-language support (i18n)", status: "todo", completed: false },
      { title: "Create a blog section for ecosystem updates", status: "todo", completed: false }
    ]
  },
  "Prolog": {
    description: "Universal book search engine and reading list manager.",
    scope: "Knowledge management and book discovery tool.",
    tasks: [
      { title: "Integrate with Open Library and Google Books APIs", status: "todo", completed: false },
      { title: "Implement advanced search filters (genre, author, year)", status: "todo", completed: false },
      { title: "Add user reading progress tracking", status: "todo", completed: false }
    ]
  },
  "GTab": {
    description: "Custom productivity-focused homepage/new-tab extension for browsers.",
    scope: "Browser extension for streamlined workflows.",
    tasks: [
      { title: "Sync bookmarks and shortcuts across browsers", status: "todo", completed: false },
      { title: "Add customizable weather and news widgets", status: "todo", completed: false },
      { title: "Implement dark/light theme toggle parity", status: "todo", completed: false }
    ]
  }
};

const defaultTasks = [
  { title: "Initialize project documentation in README", status: "todo", completed: false },
  { title: "Set up core directory structure", status: "todo", completed: false },
  { title: "Conduct initial security and dependency scan", status: "todo", completed: false }
];

async function enrichProjects() {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  
  for (const projectDoc of querySnapshot.docs) {
    const data = projectDoc.data();
    const projectId = projectDoc.id;
    const repoName = data.name;
    
    console.log(`Enriching ${repoName}...`);
    
    const enrichment = enrichmentData[repoName] || {};
    const updates = {
      description: enrichment.description || data.description || `Ongoing development for ${repoName}.`,
      scope: enrichment.scope || "General Application Development",
      tags: data.tags && data.tags.length > 0 ? data.tags : ["General"]
    };
    
    await updateDoc(doc(db, 'projects', projectId), updates);
    
    // Add tasks
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const existingTasksSnapshot = await getDocs(tasksRef);
    
    if (existingTasksSnapshot.empty) {
      const pTasks = enrichment.tasks || defaultTasks;
      for (const t of pTasks) {
        await addDoc(tasksRef, {
          ...t,
          dueDate: new Date(Date.now() + 86400000 * 14).toISOString() // 2 weeks from now
        });
      }
      console.log(`Added ${pTasks.length} tasks to ${repoName}`);
    } else {
      console.log(`Tasks already exist for ${repoName}, skipping task injection.`);
    }
  }
  console.log('Enrichment finished!');
}

enrichProjects().catch(console.error);
