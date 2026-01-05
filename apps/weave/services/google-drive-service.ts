export const GoogleDriveService = {
  isAuthenticated: false,
  
  // Configuration from Environment Variables
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '', 
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',

  async connect() {
    console.log("Connecting to Google Drive...");
    return new Promise<{success: boolean, user?: string}>((resolve) => {
        setTimeout(() => {
            this.isAuthenticated = true;
            resolve({ success: true, user: "demo_user@gmail.com" });
        }, 1500);
    });
  },

  async uploadFile(fileName: string, content: string) {
    if (!this.isAuthenticated) throw new Error("Not authenticated");
    console.log("Uploading file:", fileName);
    // Mock upload
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
};
