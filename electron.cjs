const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    icon: path.join(__dirname, 'public/lynx-logo.png'),
    autoHideMenuBar: true,
    backgroundColor: '#051224',
    title: 'DOPE WOD'
  });

  win.loadFile(path.join(__dirname, 'dist/index.html')).catch((err) => {
    console.error('Failed to load index.html. Did you run "npm run build" first?', err);
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      const myWindow = allWindows[0];
      if (myWindow.isMinimized()) myWindow.restore();
      myWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    // Check for updates automatically
    const { autoUpdater } = require('electron-updater');
    autoUpdater.checkForUpdatesAndNotify();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
