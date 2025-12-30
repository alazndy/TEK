// Google Drive Service
// Note: Requires Google OAuth token with drive.file scope

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string; // Download link
  iconLink?: string;
  parents?: string[];
}

export interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

export class DriveService {
  private token: string;

  constructor(accessToken: string) {
    this.token = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${DRIVE_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.statusText}`);
    }

    return response.json();
  }

  async listFiles(folderId?: string, pageSize = 20): Promise<DriveListResponse> {
    let query = "trashed = false";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const params = new URLSearchParams({
      q: query,
      pageSize: pageSize.toString(),
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,iconLink,parents),nextPageToken',
      orderBy: 'folder,name',
    });

    return this.request<DriveListResponse>(`/files?${params}`);
  }

  async getFile(fileId: string): Promise<DriveFile> {
    const params = new URLSearchParams({
      fields: 'id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,iconLink,parents',
    });

    return this.request<DriveFile>(`/files/${fileId}?${params}`);
  }

  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    const metadata: Record<string, unknown> = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    return this.request<DriveFile>('/files', {
      method: 'POST',
      body: JSON.stringify(metadata),
    });
  }

  async uploadFile(file: File, parentId?: string): Promise<DriveFile> {
    const metadata: Record<string, unknown> = {
      name: file.name,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    // For simple upload (files < 5MB)
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,iconLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadFileResumable(
    file: File, 
    parentId?: string,
    onProgress?: (progress: number) => void
  ): Promise<DriveFile> {
    const metadata: Record<string, unknown> = {
      name: file.name,
      mimeType: file.type, 
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    // 1. Initiate Resumable Upload
    const initResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': file.type || 'application/octet-stream',
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initResponse.ok) {
       throw new Error(`Failed to initiate upload: ${initResponse.statusText}`);
    }

    const uploadUrl = initResponse.headers.get('Location');
    if (!uploadUrl) {
        throw new Error('Failed to get upload location');
    }

    // 2. Upload File Content via XHR to support progress
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        if (xhr.upload && onProgress) {
             xhr.upload.onprogress = (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
                    onProgress(percentComplete);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (_e) {
                    console.warn('Ignored JSON parse error during upload callback', _e);
                    // Sometimes Drive returns empty body on success for certain operations? 
                    // Usually for update. For create (upload), it should return file metadata.
                    // If JSON parse fails but status is OK, we might want to fetch file metadata separately 
                    // or define what to return.
                     reject(new Error('Invalid JSON response from Drive'));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));

        xhr.send(file);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
  }
}

// Helper to check if item is a folder
export function isFolder(file: DriveFile): boolean {
  return file.mimeType === 'application/vnd.google-apps.folder';
}

// Deprecated: UI components should use Lucide icons directly based on mimeType
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getFileIcon(_mimeType: string): string {
  return 'file'; // Placeholder, handled in UI
}
