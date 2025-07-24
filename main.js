// main.js - With Mood Tracker Logic

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 450,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: true, 
    titleBarStyle: 'hidden',
    titleBarOverlay: {
        color: '#fdf6e3',
        symbolColor: '#586e75'
    }
  });

  mainWindow.loadFile('index.html');
}

// --- App Lifecycle ---
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// --- IPC Handlers ---
const diaryPath = path.join(app.getPath('userData'), 'diary-entries');
if (!fs.existsSync(diaryPath)) {
    fs.mkdirSync(diaryPath, { recursive: true });
}

// MODIFIED: The save handler now accepts and saves the 'mood'.
ipcMain.handle('save-entry', (event, { date, content, mood }) => {
    try {
        const filePath = path.join(diaryPath, `${date}.json`);
        // The JSON data now includes the mood property.
        const data = JSON.stringify({ date, content, mood });
        fs.writeFileSync(filePath, data);
        return { success: true };
    } catch (error) {
        console.error("Error saving entry:", error);
        return { success: false, error: error.message };
    }
});

// NO CHANGE NEEDED: The load handler already reads the whole file,
// so it will automatically include the mood if it exists.
ipcMain.handle('load-entry', (event, date) => {
    const filePath = path.join(diaryPath, `${date}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath);
            return JSON.parse(data);
        } catch (error) {
            console.error("Error loading entry:", error);
            return null;
        }
    }
    return null;
});

ipcMain.handle('get-all-entry-dates', () => {
    try {
        const files = fs.readdirSync(diaryPath);
        return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
    } catch (error) {
        console.error("Error getting all entry dates:", error);
        return [];
    }
});
