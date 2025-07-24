// main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// --- Function to create the application window ---
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
  // You can uncomment the line below to open DevTools for debugging
  // mainWindow.webContents.openDevTools();
}

// --- Application Lifecycle ---
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

// --- IPC Handlers for Saving and Loading Data ---

// Get the path to the user's data directory for this app
const diaryPath = path.join(app.getPath('userData'), 'diary-entries');

// Ensure the directory exists
if (!fs.existsSync(diaryPath)) {
    fs.mkdirSync(diaryPath, { recursive: true });
}

// Handle the 'save-entry' request from the renderer process
ipcMain.handle('save-entry', (event, { date, content }) => {
    try {
        const filePath = path.join(diaryPath, `${date}.json`);
        // We save the date and content in a JSON object
        const data = JSON.stringify({ date, content });
        fs.writeFileSync(filePath, data);
        return { success: true };
    } catch (error) {
        console.error("Error saving entry:", error);
        return { success: false, error: error.message };
    }
});

// Handle the 'load-entry' request
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
    return null; // No entry found
});

// Handle the 'get-all-entry-dates' request
ipcMain.handle('get-all-entry-dates', () => {
    try {
        const files = fs.readdirSync(diaryPath);
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    } catch (error) {
        console.error("Error getting all entry dates:", error);
        return [];
    }
});
