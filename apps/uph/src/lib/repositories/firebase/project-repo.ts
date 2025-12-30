
import { db } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    setDoc
} from 'firebase/firestore';
import { IProjectRepository } from '../interfaces';
import { Project, ProjectTask } from '@/types/project';

export class FirebaseProjectRepository implements IProjectRepository {
    private collectionName = 'projects';

    async all(): Promise<Project[]> {
        const querySnapshot = await getDocs(collection(db, this.collectionName));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            logoUrl: (doc.data() as { logoUrl?: string }).logoUrl || '/logo.png'
        })) as Project[];
    }

    async getById(id: string): Promise<Project | null> {
        const docSnap = await getDoc(doc(db, this.collectionName, id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Project;
        }
        return null;
    }

    async create(data: Omit<Project, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, this.collectionName), data);
        return docRef.id;
    }

    async update(id: string, data: Partial<Project>): Promise<void> {
        const projectRef = doc(db, this.collectionName, id);
        // Remove undefined fields to avoid Firestore errors
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );
        await updateDoc(projectRef, cleanData);
    }

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, this.collectionName, id));
    }

    async getTasks(projectId: string): Promise<ProjectTask[]> {
        const tasksSnap = await getDocs(collection(db, this.collectionName, projectId, 'tasks'));
        return tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTask));
    }

    async addTask(projectId: string, data: Omit<ProjectTask, 'id'>): Promise<string> {
        const ref = await addDoc(collection(db, this.collectionName, projectId, 'tasks'), data);
        return ref.id;
    }

    async updateTask(projectId: string, taskId: string, data: Partial<ProjectTask>): Promise<void> {
        await updateDoc(doc(db, this.collectionName, projectId, 'tasks', taskId), data);
    }

    async deleteTask(projectId: string, taskId: string): Promise<void> {
        await deleteDoc(doc(db, this.collectionName, projectId, 'tasks', taskId));
    }

    async updateSubtasks(projectId: string, taskId: string, subtasks: any[]): Promise<void> {
        await updateDoc(doc(db, this.collectionName, projectId, 'tasks', taskId), { subtasks });
    }

    async updateComments(projectId: string, taskId: string, comments: any[]): Promise<void> {
        await updateDoc(doc(db, this.collectionName, projectId, 'tasks', taskId), { comments });
    }

    async syncReadme(projectId: string, content: string): Promise<void> {
        const projectRef = doc(db, this.collectionName, projectId);
        await updateDoc(projectRef, { readmeContent: content });
    }
}
