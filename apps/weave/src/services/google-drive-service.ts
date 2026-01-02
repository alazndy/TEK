import { GoogleDriveService as SharedDriveService } from '@t-ecosystem/integrations';

// Initialize with environment variables
const serviceInstance = new SharedDriveService({
    clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '',
    apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || ''
});

// Export an object that matches the old API interface for backward compatibility
export const GoogleDriveService = {
    // We proxy properties to the instance or keep local state if needed.
    // The old service had 'isAuthenticated' property.
    // The new service has private isAuthenticated. 
    // We might need to expose a getter or wrap connect.
    
    isAuthenticated: false, // Local tracker for UI compatibility

    async connect() {
        const res = await serviceInstance.connect();
        if (res.success) {
            this.isAuthenticated = true;
        }
        return res;
    },

    async uploadFile(fileName: string, content: string) {
        return serviceInstance.uploadFile(fileName, content);
    }
};
