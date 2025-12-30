const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Add any native bridge functions here if needed
  platform: process.platform,
});
