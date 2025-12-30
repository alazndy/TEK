// File Version Types

export interface FileVersion {
  id: string;
  fileId: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName?: string;
  comment?: string;
  isLatest: boolean;
  checksum?: string; // For integrity verification
  changes?: string; // Summary of changes
  createdAt: Date;
}

export interface VersionedFile {
  id: string;
  projectId: string;
  originalName: string;
  currentVersionId: string;
  currentVersionNumber: number;
  totalVersions: number;
  category: 'document' | 'design' | 'code' | 'image' | 'other';
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  lockedBy?: string; // User ID if file is locked for editing
  lockedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionComparison {
  fileId: string;
  versionA: FileVersion;
  versionB: FileVersion;
  sizeDiff: number;
  changesCount?: number;
}

export interface FileActivity {
  id: string;
  fileId: string;
  versionId?: string;
  action: 'upload' | 'download' | 'view' | 'delete' | 'restore' | 'lock' | 'unlock' | 'comment';
  userId: string;
  userName?: string;
  details?: string;
  createdAt: Date;
}
