import { useAuthStore } from '@/stores/auth-store';

export const GoogleDriveService = {
  getToken() {
    return useAuthStore.getState().googleAccessToken;
  },

  async checkConnection() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
        const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.ok;
    } catch (_) {
        return false;
    }
  },

  async connect() {
      // Mock connection for now
      return new Promise<any>((resolve) => {
          setTimeout(() => {
              resolve({
                  user: "Mock Google User",
                  displayName: "Mock Google User",
                  email: "mock@gmail.com"
              });
          }, 1000);
      });
  },

  async listFiles(folderId: string) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated with Google');

    const query = `'${folderId}' in parents and trashed = false`;
    const fields = 'files(id, name, mimeType, webViewLink, iconLink, size, modifiedTime)';
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to list files');
    }

    const data = await response.json();
    return data.files || [];
  },

  async createFolder(name: string, parentId?: string) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated with Google');

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create folder');
    }

    return await response.json();
  },

  async uploadFile(file: File, folderId: string) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated with Google');

    const metadata = {
      name: file.name,
      parents: [folderId]
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    // Using multipart upload
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload file');
    }

    return await response.json();
  }
};
