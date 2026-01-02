export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
}

export interface DriveConnectResponse {
  success: boolean;
  user?: string;
}

export class GoogleDriveService {
  private isAuthenticated: boolean = false;
  private config: GoogleDriveConfig;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
  }

  async connect(): Promise<DriveConnectResponse> {
    console.log("Connecting to Google Drive with ID:", this.config.clientId);
    return new Promise((resolve) => {
        setTimeout(() => {
            this.isAuthenticated = true;
            resolve({ success: true, user: "demo_user@gmail.com" });
        }, 1500);
    });
  }

  async uploadFile(fileName: string, content: string): Promise<void> {
    if (!this.isAuthenticated) throw new Error("Not authenticated");
    console.log("Uploading file:", fileName);
    // Mock upload
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
