import { GoogleDriveService as SharedDriveService } from '@t-ecosystem/integrations';

// Next.js uses process.env usually, but check validity. 
// If it's client side, it might need NEXT_PUBLIC prefix or specific config.
// Assuming process.env works as per previous file content check.

const serviceInstance = new SharedDriveService({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || '',
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || ''
});

export const GoogleDriveService = {
    isAuthenticated: false,

    async connect() {
        // Adapt response if needed, or pass through
        const res = await serviceInstance.connect();
        if (res.success) {
            this.isAuthenticated = true;
        }
        return res;
    }
};
