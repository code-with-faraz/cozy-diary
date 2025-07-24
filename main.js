// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Function to create the main application window
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 450,
    webPreferences: {
      // Preload script to safely expose Node.js functionality to the renderer process
      preload: path.join(__dirname, 'preload.js'),
      // It's recommended to keep contextIsolation enabled for security
      contextIsolation: true,
      // It's recommended to keep nodeIntegration disabled for security
      nodeIntegration: false,
    },
    // Adding a frame and title bar for a more native feel
    frame: true, 
    titleBarStyle: 'hidden',
    titleBarOverlay: {
        color: '#fdf6e3', // A soft, cozy color for the title bar
        symbolColor: '#586e75' // A contrasting color for window controls
    }
  });

  // Load the index.html of the app.
  mainWindow.loadFile('index.html');

  // You can uncomment the line below to open the DevTools for debugging
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. 
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers for Diary Entries ---

// Use app.getPath('userData') which is the standard location for app data
const diaryPath = path.join(app.getPath('userData'), 'diary-entries');

// Ensure the directory exists, create it if it doesn't
if (!fs.existsSync(diaryPath)) {
    fs.mkdirSync(diaryPath, { recursive: true });
}

// Handle request from the renderer to save an entry
ipcMain.handle('save-entry', (event, { date, content }) => {
    try {
        const filePath = path.join(diaryPath, `${date}.json`);
        const data = JSON.stringify({ date, content });
        fs.writeFileSync(filePath, data);
        return { success: true, path: filePath };
    } catch (error) {
        console.error("Failed to save entry:", error);
        return { success: false, error: error.message };
    }
});

// Handle request from the renderer to load an entry
ipcMain.handle('load-entry', (event, date) => {
    try {
        const filePath = path.join(diaryPath, `${date}.json`);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to load entry:", error);
    }
    return null; // Return null if no entry exists or an error occurs
});

// Handle request from the renderer to get all entry dates
ipcMain.handle('get-all-entry-dates', () => {
    try {
        const files = fs.readdirSync(diaryPath);
        // Filter for .json files and map to just the date part of the filename
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    } catch (error) {
        console.error("Failed to get entry dates:", error);
        return []; // Return an empty array on error
    }
});