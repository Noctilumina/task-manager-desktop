import { contextBridge } from 'electron';

// Expose any needed APIs to renderer process here
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
