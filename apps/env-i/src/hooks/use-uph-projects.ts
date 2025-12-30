import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { uphDb } from '@/lib/uph-firebase';
import { toast } from '@/hooks/use-toast';

export interface UPHProject {
    id: string;
    name: string; // "Project Name"
    code: string; // "PRJ-001"
    status: 'Planlama' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal';
    client?: string;
    startDate?: string;
    description?: string;
}

export function useUPHProjects() {
    const [projects, setProjects] = useState<UPHProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
             if (!uphDb) {
                 // Fallback to mock if DB not connected (for dev/demo)
                 setProjects([
                     { id: 'mock-1', name: 'UPH Demo Project A', code: 'UPH-001', status: 'Devam Ediyor', client: 'Acme Corp' },
                     { id: 'mock-2', name: 'UPH Demo Project B', code: 'UPH-002', status: 'Planlama', client: 'Globex' },
                 ]);
                 return;
             }

             setLoading(true);
             try {
                // Assuming 'projects' collection exists in UPH
                const q = query(collection(uphDb, 'projects'), orderBy('createdAt', 'desc'), limit(20)); // Adjust field names as needed
                const snapshot = await getDocs(q);
                const fetchedProjects = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as UPHProject[];
                setProjects(fetchedProjects);
             } catch (err) {
                 console.error("Error fetching UPH projects:", err);
                 setError("UPH bağlantı hatası");
                 // toast({ title: "UPH Hatası", description: "Projeler çekilemedi.", variant: "destructive" });
             } finally {
                 setLoading(false);
             }
        };

        fetchProjects();
    }, []);

    return { projects, loading, error };
}
