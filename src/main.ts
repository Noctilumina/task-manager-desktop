import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 5000;
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
    server.listen(PORT, 'localhost', () => resolve());
    server.on('error', reject);
  });
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function httpsPost(url: string, data: Record<string, string>): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(data).toString();
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Bad token response: ' + raw)); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Google OAuth with PKCE — bypasses signInWithPopup which is broken in Electron due to COOP headers
ipcMain.handle('google-auth', async () => {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  const clientId = process.env.GOOGLE_WEB_CLIENT_ID ?? '';
  const redirectUri = `http://localhost:${PORT}`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('prompt', 'select_account');

  const popup = new BrowserWindow({
    width: 500, height: 700, title: 'Sign in with Google',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  popup.setMenuBarVisibility(false);
  popup.loadURL(authUrl.toString());

  return new Promise<string>((resolve, reject) => {
    const tryCapture = async (_e: Electron.Event, url: string) => {
      if (!url.startsWith(redirectUri)) return;
      const code = new URL(url).searchParams.get('code');
      if (!code) { reject(new Error('No auth code')); return; }
      popup.destroy();
      try {
        const tokens = await httpsPost('https://oauth2.googleapis.com/token', {
          code, client_id: clientId, client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
          redirect_uri: redirectUri, grant_type: 'authorization_code', code_verifier: verifier,
        });
        if (tokens.error) { reject(new Error(String(tokens.error_description ?? tokens.error))); return; }
        resolve(tokens.id_token);
      } catch (e) { reject(e); }
    };

    popup.webContents.on('will-redirect', tryCapture);
    popup.webContents.on('will-navigate', tryCapture);
    popup.on('closed', () => reject(new Error('cancelled')));
  });
});

async function createWindow() {
  const root = path.join(__dirname, '..');
  await startServer(root);

  const win = new BrowserWindow({
    width: 1024, height: 768, minWidth: 600, minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
  });

  Menu.setApplicationMenu(null);
  win.webContents.openDevTools({ mode: 'bottom' });
  win.loadURL(`http://localhost:${PORT}`);
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
