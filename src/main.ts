import { app, BrowserWindow, Menu } from 'electron';
import http from 'http';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 21342;
const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
};

function startServer(root: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url === '/' ? '/index.html' : req.url ?? '/index.html').split('?')[0];
      const filePath = path.join(root, urlPath);
      const contentType = MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });
}

async function createWindow() {
  const root = path.join(__dirname, '..');
  await startServer(root);

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

  win.loadURL(`http://127.0.0.1:${PORT}`);
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
