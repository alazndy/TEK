import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { FileVersion, VersionedFile, FileActivity } from '@/types/file-version';

interface FileVersionState {
  files: VersionedFile[];
  currentFile: VersionedFile | null;
  versions: FileVersion[];
  activities: FileActivity[];
  loading: boolean;
  error: string | null;
}

interface FileVersionActions {
  fetchFiles: (projectId: string) => Promise<void>;
  fetchVersionedFile: (fileId: string) => Promise<void>;
  fetchVersions: (fileId: string) => Promise<void>;
  fetchActivities: (fileId: string) => Promise<void>;
  
  uploadNewVersion: (
    fileId: string | null,
    file: File,
    projectId: string,
    userId: string,
    comment?: string
  ) => Promise<string>;
  
  deleteVersion: (fileId: string, versionId: string) => Promise<void>;
  restoreVersion: (fileId: string, versionId: string, userId: string) => Promise<void>;
  
  lockFile: (fileId: string, userId: string) => Promise<void>;
  unlockFile: (fileId: string) => Promise<void>;
  
  logActivity: (activity: Omit<FileActivity, 'id' | 'createdAt'>) => Promise<void>;
  
  getFileById: (id: string) => VersionedFile | undefined;
  getLatestVersion: (fileId: string) => FileVersion | undefined;
  compareVersions: (fileId: string, versionAId: string, versionBId: string) => {
    versionA: FileVersion | undefined;
    versionB: FileVersion | undefined;
    sizeDiff: number;
  };
}

type FileVersionStore = FileVersionState & FileVersionActions;

export const useFileVersionStore = create<FileVersionStore>((set, get) => ({
  files: [],
  currentFile: null,
  versions: [],
  activities: [],
  loading: false,
  error: null,

  fetchFiles: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'versionedFiles'),
        where('projectId', '==', projectId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const files = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lockedAt: data.lockedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as VersionedFile[];
      
      set({ files, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching versioned files:', error);
    }
  },

  fetchVersionedFile: async (fileId) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(db, 'versionedFiles', fileId);
      const docSnap = await import('firebase/firestore').then(mod => mod.getDoc(docRef));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentFile = {
          id: docSnap.id,
          ...data,
          lockedAt: data.lockedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as VersionedFile;
        
        set({ currentFile, loading: false });
      } else {
        set({ error: 'File not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching versioned file:', error);
    }
  },

  fetchVersions: async (fileId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'fileVersions'),
        where('fileId', '==', fileId),
        orderBy('versionNumber', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const versions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FileVersion[];
      
      set({ versions, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching versions:', error);
    }
  },

  fetchActivities: async (fileId) => {
    try {
      const q = query(
        collection(db, 'fileActivities'),
        where('fileId', '==', fileId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FileActivity[];
      
      set({ activities });
    } catch (error: any) {
      console.error('Error fetching file activities:', error);
    }
  },

  uploadNewVersion: async (fileId, file, projectId, userId, comment) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      let targetFileId = fileId;
      let versionNumber = 1;
      
      // If no fileId, create new versioned file
      if (!fileId) {
        const category = getFileCategory(file.type);
        
        const newFile: Omit<VersionedFile, 'id'> = {
          projectId,
          originalName: file.name,
          currentVersionId: '', // Will be updated after version upload
          currentVersionNumber: 1,
          totalVersions: 1,
          category,
          fileSize: file.size,
          mimeType: file.type,
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
        };
        
        const fileDocRef = await addDoc(collection(db, 'versionedFiles'), {
          ...newFile,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        });
        
        targetFileId = fileDocRef.id;
      } else {
        // Get current version number
        const existingFile = get().getFileById(fileId);
        if (existingFile) {
          versionNumber = existingFile.currentVersionNumber + 1;
        }
      }
      
      // Upload file to storage
      const storageRef = ref(storage, `versions/${targetFileId}/v${versionNumber}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);
      
      // Create version record
      const version: Omit<FileVersion, 'id'> = {
        fileId: targetFileId!,
        versionNumber,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: userId,
        comment,
        isLatest: true,
        createdAt: now,
      };
      
      const versionDocRef = await addDoc(collection(db, 'fileVersions'), {
        ...version,
        createdAt: Timestamp.fromDate(now),
      });
      
      // Update previous version's isLatest to false
      if (fileId) {
        const previousVersions = get().versions.filter(v => v.fileId === fileId && v.isLatest);
        for (const prev of previousVersions) {
          await updateDoc(doc(db, 'fileVersions', prev.id), { isLatest: false });
        }
      }
      
      // Update file record
      await updateDoc(doc(db, 'versionedFiles', targetFileId!), {
        currentVersionId: versionDocRef.id,
        currentVersionNumber: versionNumber,
        totalVersions: versionNumber,
        fileSize: file.size,
        mimeType: file.type,
        updatedAt: Timestamp.fromDate(now),
      });
      
      // Log activity
      await get().logActivity({
        fileId: targetFileId!,
        versionId: versionDocRef.id,
        action: 'upload',
        userId,
        details: comment || `Version ${versionNumber} uploaded`,
      });
      
      // Refresh data
      await get().fetchFiles(projectId);
      await get().fetchVersions(targetFileId!);
      
      set({ loading: false });
      return targetFileId!;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVersion: async (fileId, versionId) => {
    set({ loading: true, error: null });
    try {
      const version = get().versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');
      
      // Delete from storage
      const storageRef = ref(storage, `versions/${fileId}/v${version.versionNumber}_${version.fileName}`);
      await deleteObject(storageRef).catch(() => {}); // Ignore if already deleted
      
      // Delete version record
      await deleteDoc(doc(db, 'fileVersions', versionId));
      
      // Update file if this was the latest
      if (version.isLatest) {
        const remainingVersions = get().versions
          .filter(v => v.id !== versionId)
          .sort((a, b) => b.versionNumber - a.versionNumber);
        
        if (remainingVersions.length > 0) {
          const newLatest = remainingVersions[0];
          await updateDoc(doc(db, 'fileVersions', newLatest.id), { isLatest: true });
          await updateDoc(doc(db, 'versionedFiles', fileId), {
            currentVersionId: newLatest.id,
            currentVersionNumber: newLatest.versionNumber,
            totalVersions: remainingVersions.length,
          });
        } else {
          // Delete the file record if no versions left
          await deleteDoc(doc(db, 'versionedFiles', fileId));
        }
      }
      
      set(state => ({
        versions: state.versions.filter(v => v.id !== versionId),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  restoreVersion: async (fileId, versionId, userId) => {
    set({ loading: true, error: null });
    try {
      const version = get().versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');
      
      const currentLatest = get().versions.find(v => v.fileId === fileId && v.isLatest);
      const newVersionNumber = currentLatest ? currentLatest.versionNumber + 1 : 1;
      
      const now = new Date();
      
      // Create a new version based on the restored one
      const restoredVersion: Omit<FileVersion, 'id'> = {
        fileId,
        versionNumber: newVersionNumber,
        fileName: version.fileName,
        fileUrl: version.fileUrl,
        fileSize: version.fileSize,
        mimeType: version.mimeType,
        uploadedBy: userId,
        comment: `Restored from v${version.versionNumber}`,
        isLatest: true,
        createdAt: now,
      };
      
      // Mark current latest as not latest
      if (currentLatest) {
        await updateDoc(doc(db, 'fileVersions', currentLatest.id), { isLatest: false });
      }
      
      const newVersionRef = await addDoc(collection(db, 'fileVersions'), {
        ...restoredVersion,
        createdAt: Timestamp.fromDate(now),
      });
      
      // Update file record
      await updateDoc(doc(db, 'versionedFiles', fileId), {
        currentVersionId: newVersionRef.id,
        currentVersionNumber: newVersionNumber,
        totalVersions: newVersionNumber,
        updatedAt: Timestamp.fromDate(now),
      });
      
      await get().logActivity({
        fileId,
        versionId: newVersionRef.id,
        action: 'restore',
        userId,
        details: `Restored from version ${version.versionNumber}`,
      });
      
      await get().fetchVersions(fileId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  lockFile: async (fileId, userId) => {
    const now = new Date();
    await updateDoc(doc(db, 'versionedFiles', fileId), {
      lockedBy: userId,
      lockedAt: Timestamp.fromDate(now),
    });
    
    await get().logActivity({
      fileId,
      action: 'lock',
      userId,
    });
    
    set(state => ({
      files: state.files.map(f => 
        f.id === fileId ? { ...f, lockedBy: userId, lockedAt: now } : f
      ),
    }));
  },

  unlockFile: async (fileId) => {
    const file = get().getFileById(fileId);
    
    await updateDoc(doc(db, 'versionedFiles', fileId), {
      lockedBy: null,
      lockedAt: null,
    });
    
    if (file?.lockedBy) {
      await get().logActivity({
        fileId,
        action: 'unlock',
        userId: file.lockedBy,
      });
    }
    
    set(state => ({
      files: state.files.map(f => 
        f.id === fileId ? { ...f, lockedBy: undefined, lockedAt: undefined } : f
      ),
    }));
  },

  logActivity: async (activity) => {
    try {
      await addDoc(collection(db, 'fileActivities'), {
        ...activity,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (error: any) {
      console.error('Error logging file activity:', error);
    }
  },

  getFileById: (id) => {
    return get().files.find(f => f.id === id);
  },

  getLatestVersion: (fileId) => {
    return get().versions.find(v => v.fileId === fileId && v.isLatest);
  },

  compareVersions: (fileId, versionAId, versionBId) => {
    const versionA = get().versions.find(v => v.id === versionAId);
    const versionB = get().versions.find(v => v.id === versionBId);
    
    const sizeDiff = (versionB?.fileSize || 0) - (versionA?.fileSize || 0);
    
    return { versionA, versionB, sizeDiff };
  },
}));

function getFileCategory(mimeType: string): 'document' | 'design' | 'code' | 'image' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml')) return 'code';
  return 'other';
}
