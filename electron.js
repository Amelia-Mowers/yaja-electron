const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const jsonfile = require('jsonfile');

ipcMain.handle('open-file-dialog', async () => {
    const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'json', extensions: ['json'] }] });
    return filePaths;
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const jobDataArray = await jsonfile.readFile(filePath);
    return { success: true, data: jobDataArray };
  } catch (err) {
    console.error('Error reading file:', err);
    return { success: false, error: err };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: true,
    },
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  win.loadURL(url);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
