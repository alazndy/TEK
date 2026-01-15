
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

const rawData = `2724D	VBV-790C	Stok Malzemesi	1	Depo / A1
2808C	VBV-710C	Stok Malzemesi	2	Depo / A1
3044A	SS-002	Stok Malzemesi	1	Depo / A1
3176B	VBV-7X0M-CA	Stok Malzemesi	1	Depo / A1
3719	UDS-2.5SC	Stok Malzemesi	2	Depo / A1
3720	UDS-4.5SC	Stok Malzemesi	9	Depo / A1
3721	UDS-00SS	Stok Malzemesi	27	Depo / A1
3726	UDS-00SM	Stok Malzemesi	20	Depo / A1
3749	UDS-001DP	Stok Malzemesi	1	Depo / A1
4043	DW-1000TX	Stok Malzemesi	1	Depo / A1
4267	AC-055	Stok Malzemesi	10	Depo / A1
4279	AC-044	Stok Malzemesi	4	Depo / A1
4485	BN360-100C	Stok Malzemesi	1	Depo / A1
4486	BN360-10H-01	Stok Malzemesi	1	Depo / A1
4489	BN360-CP-01	Stok Malzemesi	1	Depo / A1
4493	BN360-L120	Stok Malzemesi	3	Depo / A1
4494	BN360-L1025	Stok Malzemesi	5	Depo / A1
4495	BN360-L115	Stok Malzemesi	6	Depo / A1
4496	BN360-L110	Stok Malzemesi	7	Depo / A1
4498	BN360-L105	Stok Malzemesi	3	Depo / A1
4520	BN360-CT-01	Stok Malzemesi	1	Depo / A1
4569A	VBV-7XXFM-CA	Stok Malzemesi	1	Depo / A1
4864	BN360-100C-MK	Stok Malzemesi	1	Depo / A1
4903	AC-305	Stok Malzemesi	10	Depo / A1
4910A	DMC-1025	Stok Malzemesi	1	Depo / A1
5266	BS-9000	Stok Malzemesi	1	Depo / A1
5288	UDS-CBL002	Stok Malzemesi	1	Depo / A1
5466	VBV-7100C	Stok Malzemesi	4	Depo / A1
5516	VBV-H410	Stok Malzemesi	2	Depo / A1
5517	VBV-H407	Stok Malzemesi	1	Depo / A1
5522	VBV-H4025	Stok Malzemesi	1	Depo / A1
5611A	VBV-770HM	Stok Malzemesi	3	Depo / A1
5623	UDS-7.0SC	Stok Malzemesi	57	Depo / A1
5677	UDS-8.0SC	Stok Malzemesi	1	Depo / A1
5793	BN360-INT-01	Stok Malzemesi	1	Depo / A1
5794	BN360-PWR-01	Stok Malzemesi	1	Depo / A1
5798	BN360-VIN-01	Stok Malzemesi	1	Depo / A1
5800A	BN360-300	Stok Malzemesi	1	Depo / A1
5802	BN360-1000C	Stok Malzemesi	4	Depo / A1
5803	BN360-VO-01	Stok Malzemesi	1	Depo / A1
5810	BN360-H315	Stok Malzemesi	1	Depo / A1
5811	BN360-H310	Stok Malzemesi	11	Depo / A1
5812	BN360-H305	Stok Malzemesi	15	Depo / A1
5813	BN360-H3025	Stok Malzemesi	5	Depo / A1
5849	CS-3100T	Stok Malzemesi	1	Depo / A1
5863	UDS-CAN-ECU	Stok Malzemesi	2	Depo / A1
6291	DC-102_UK_32GB_HG	Stok Malzemesi	5	Depo / A1
6292	DC-REAR-CAM	Stok Malzemesi	1	Depo / A1
6293	DC-IR-CAM	Stok Malzemesi	4	Depo / A1
6296	LOCKING -BOX	Stok Malzemesi	11	Depo / A1
6582	MDR-644	Stok Malzemesi	1	Depo / A1
6648	AC-H305	Stok Malzemesi	9	Depo / A1
7088	DW-2000TX	Stok Malzemesi	3	Depo / A1
7089	DW-2000RX	Stok Malzemesi	3	Depo / A1
7145	VBV-3120C	Stok Malzemesi	4	Depo / A1
7321	VBV-2220C-AI-D04	Stok Malzemesi	1	Depo / A1
7477	DC-204-AI	Stok Malzemesi	1	Depo / A1
7490	VBV-AI805	Stok Malzemesi	10	Depo / A1
7491	VBV-AI820	Stok Malzemesi	2	Depo / A1
7508	VBV-AI810	Stok Malzemesi	4	Depo / A1
A0990	BC-VI-2 MASTER	Stok Malzemesi	6	Depo / A1
A1386	VBV-L410	Stok Malzemesi	3	Depo / A1
A1499	VBV-L405	Stok Malzemesi	8	Depo / A1
A2099	BE-X005	Stok Malzemesi	1	Depo / A1
A3744	BS-4000W	Stok Malzemesi	2	Depo / A1
A3747	FS-4000W	Stok Malzemesi	1	Depo / A1
AC-001	AC-001	Stok Malzemesi	1	Depo / A1
AC-014	AC-014	Stok Malzemesi	10	Depo / A1
BS-00NYC	BS-00NYC	Stok Malzemesi	4	Depo / A1
BS-9001T	BS-9001T	Stok Malzemesi	1	Depo / A1
F3154	VBV-L4005	Stok Malzemesi	10	Depo / A1
MgPgxs...	BC-VI	Stok Malzemesi	87	Depo / A1
S3702	AC-035	Stok Malzemesi	10	Depo / A1
S5201	BN360-200-ECU	Stok Malzemesi	1	Depo / A1
S5802A	BN360-1000C	Stok Malzemesi	6	Depo / A1
UDS-000HSS	UDS-000HSS	Stok Malzemesi	20	Depo / A1
UDS-00HSS	UDS-00HSS	Stok Malzemesi	1	Depo / A1
(Ekipman)	ESP32 DevKit	Demirbaş	2	Atölye / 11
(Ekipman)	ESP32-S3 DevKit	Demirbaş	1	Atölye / 11`;

async function importList() {
    const lines = rawData.split('\n');
    console.log(`Analyzing ${lines.length} lines of data...`);

    let successCount = 0;
    let failCount = 0;

    for (const line of lines) {
        if (!line.trim() || line.startsWith('ID')) continue; // Skip header and empty lines

        // Split by tab (or spaces if needed)
        // Adjust regex if copied from standard tabular source
        const parts = line.split('\t').map(p => p.trim());
        
        if (parts.length < 5) {
            console.warn("Skipping invalid line:", line);
            failCount++;
            continue;
        }

        const [id, name, category, stockRaw, locationRaw] = parts;
        const stock = parseInt(stockRaw) || 0;
        
        // Parse Location "Depo / A1"
        const [room, shelf] = locationRaw.includes('/') 
            ? locationRaw.split('/').map(l => l.trim()) 
            : [locationRaw, ''];

        const item = {
            id: id === '(Ekipman)' ? `EQ-${Date.now()}-${Math.floor(Math.random()*1000)}` : id,
            name: name,
            category: category,
            stock: stock,
            room: room,
            shelf: shelf,
            parcode: id !== '(Ekipman)' ? id : '',
            manufacturer: '', // Default
            description: 'Manuel İçe Aktarım',
            createdAt: new Date().toISOString()
        };

        try {
            if (category === 'Demirbaş') {
                await addDoc(collection(db, 'equipment'), item);
                console.log(`✅ [Equipment] Imported: ${name}`);
            } else {
                // Products
                await addDoc(collection(db, 'products'), item);
                console.log(`✅ [Product] Imported: ${name} (${id})`);
            }
            successCount++;
        } catch (error) {
            console.error(`❌ Error importing ${name}:`, error);
            failCount++;
        }
    }

    console.log(`\nImport Completed.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

importList();
