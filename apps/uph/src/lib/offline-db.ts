import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 't-hub-offline-db';
const DB_VERSION = 1;

export interface OfflineSchema {
  projects: {
    key: string;
    value: any;
  };
  inventory: {
    key: string;
    value: any;
  };
  engineering: {
    key: string;
    value: any;
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      module: string;
      data: any;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineSchema>>;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<OfflineSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('projects', { keyPath: 'id' });
        db.createObjectStore('inventory', { keyPath: 'id' });
        db.createObjectStore('engineering', { keyPath: 'id' });
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const offlineStorage = {
  async save(storeName: keyof OfflineSchema, data: any) {
    const db = await getDB();
    return db.put(storeName, data);
  },
  
  async get(storeName: keyof OfflineSchema, id: string) {
    const db = await getDB();
    return db.get(storeName, id);
  },
  
  async getAll(storeName: keyof OfflineSchema) {
    const db = await getDB();
    return db.getAll(storeName);
  },
  
  async delete(storeName: keyof OfflineSchema, id: string) {
    const db = await getDB();
    return db.delete(storeName, id);
  }
};
