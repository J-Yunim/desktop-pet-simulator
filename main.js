import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,     // Makes the background transparent
    frame: false,           // Removes the window border/buttons
    alwaysOnTop: true,      // Keeps pets above other apps
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  import('electron').then(({ ipcMain }) => {
    ipcMain.removeAllListeners('toggle-always-on-top');
    ipcMain.on('toggle-always-on-top', (event, isTop) => {
      if (win && !win.isDestroyed()) {
        win.setAlwaysOnTop(isTop);
      }
    });
  });

  // In development, load from the Vite dev server
  // In production, load the built index.html
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'dist/index.html')}`;

  win.loadURL(startUrl);
  win.webContents.openDevTools({ mode: 'detach' });

  // Allow clicking through transparent areas (optional)
  win.setIgnoreMouseEvents(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});