import { create } from 'zustand';
import { AuditLogEntry, ExtendedRole, Permission, ROLE_PERMISSIONS } from '@/types/security';

interface AuditState {
  logs: AuditLogEntry[];
  isLoading: boolean;
  
  // Actions
  addLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash' | 'previousHash'>) => Promise<void>;
  verifyIntegrity: () => boolean;
  canPerform: (role: ExtendedRole, permission: Permission) => boolean;
  checkSoD: (userId: string, action: string, resourceId: string) => boolean;
}

// Simple mock hashing function for demonstration
const mockHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
};

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  isLoading: false,

  addLog: async (entryData) => {
    const { logs } = get();
    const previousHash = logs.length > 0 ? logs[0].hash : '0';
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    
    const contentToHash = `${id}${timestamp}${entryData.userId}${entryData.action}${previousHash}`;
    const hash = mockHash(contentToHash);

    const newEntry: AuditLogEntry = {
      ...entryData,
      id,
      timestamp,
      hash,
      previousHash
    };

    set(state => ({ logs: [newEntry, ...state.logs] }));
  },

  verifyIntegrity: () => {
    const { logs } = get();
    if (logs.length <= 1) return true;

    for (let i = 0; i < logs.length - 1; i++) {
        const current = logs[i];
        const next = logs[i+1];
        if (current.previousHash !== next.hash) {
            return false;
        }
    }
    return true;
  },

  canPerform: (role, permission) => {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
  },

  checkSoD: (userId, action, resourceId) => {
    const { logs } = get();
    // Example SoD Rule: Requesters cannot be Approvers
    if (action === 'approve:engineering') {
        const creationLog = logs.find(l => 
            l.module === 'engineering' && 
            l.resourceId === resourceId && 
            l.action === 'create:ecr'
        );
        if (creationLog && creationLog.userId === userId) {
            return false; // Forbidden by SoD
        }
    }
    return true;
  }
}));
