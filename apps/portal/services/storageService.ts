
import { SavedPrompt } from '../types';

const DB_NAME = 'RenderAppDB';
const DB_VERSION = 2; // Version bumped for new store
const STORE_GALLERY = 'gallery';
const STORE_STATE = 'appState';
const STORE_PROMPTS = 'savedPrompts';
const MAX_GALLERY_ITEMS = 50;

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_GALLERY)) {
                db.createObjectStore(STORE_GALLERY, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORE_STATE)) {
                db.createObjectStore(STORE_STATE);
            }
            if (!db.objectStoreNames.contains(STORE_PROMPTS)) {
                db.createObjectStore(STORE_PROMPTS, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const storageService = {
    // Gallery Operations
    async saveToGallery(imageUrl: string): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_GALLERY, 'readwrite');
            const store = transaction.objectStore(STORE_GALLERY);

            // First check the count
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                const count = countRequest.result;
                const deleteNeeded = Math.max(0, count - MAX_GALLERY_ITEMS + 1);

                if (deleteNeeded > 0) {
                    const cursorRequest = store.openCursor(); 
                    let deletedCount = 0;

                    cursorRequest.onsuccess = (e) => {
                        const cursor = (e.target as IDBRequest).result;
                        if (cursor && deletedCount < deleteNeeded) {
                            cursor.delete();
                            deletedCount++;
                            cursor.continue(); 
                        } else {
                            store.add({ imageUrl, createdAt: Date.now() });
                        }
                    };
                    cursorRequest.onerror = () => reject(cursorRequest.error);
                } else {
                    store.add({ imageUrl, createdAt: Date.now() });
                }
            };

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(transaction.error || (event.target as any).error);
        });
    },

    async getGallery(): Promise<string[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_GALLERY, 'readonly');
            const store = transaction.objectStore(STORE_GALLERY);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result as { imageUrl: string, createdAt: number }[];
                results.sort((a, b) => b.createdAt - a.createdAt);
                resolve(results.map(r => r.imageUrl));
            };
            request.onerror = () => reject(request.error);
        });
    },

    // App State Operations
    async saveAppState(state: any): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_STATE, 'readwrite');
            const store = transaction.objectStore(STORE_STATE);
            const request = store.put(state, 'latest');
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getAppState(): Promise<any> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_STATE, 'readonly');
            const store = transaction.objectStore(STORE_STATE);
            const request = store.get('latest');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async clearAppState(): Promise<void> {
         const db = await openDB();
         return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_STATE], 'readwrite');
            transaction.objectStore(STORE_STATE).clear();
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
         });
    },

    // Prompt Library Operations
    async savePrompt(title: string, content: string): Promise<SavedPrompt> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_PROMPTS, 'readwrite');
            const store = transaction.objectStore(STORE_PROMPTS);
            const newItem = { title, content, createdAt: Date.now() };
            const request = store.add(newItem);
            
            request.onsuccess = () => {
                resolve({ ...newItem, id: request.result as number });
            };
            request.onerror = () => reject(request.error);
        });
    },

    async getPrompts(): Promise<SavedPrompt[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_PROMPTS, 'readonly');
            const store = transaction.objectStore(STORE_PROMPTS);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result as SavedPrompt[];
                results.sort((a, b) => b.createdAt - a.createdAt);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    },

    async deletePrompt(id: number): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_PROMPTS, 'readwrite');
            const store = transaction.objectStore(STORE_PROMPTS);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
