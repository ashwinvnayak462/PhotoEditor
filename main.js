const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 1080,
    minWidth: 1120,
    minHeight: 760,
    backgroundColor: '#f5f1e8',
    title: 'AVNEditor',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(null);
  window.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
