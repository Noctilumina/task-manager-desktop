import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
  });

  Menu.setApplicationMenu(null);

  // Allow Firebase Google OAuth popup windows
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.startsWith('https://accounts.google.com') ||
      url.startsWith(`https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`)
    ) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  win.loadFile(path.join(__dirname, '../index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
