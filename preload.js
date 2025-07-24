// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Securely expose functions to the renderer process (index.html)
contextBridge.exposeInMainWorld('electronAPI', {
  // Function to save an entry. It passes the data to the main process.
  saveEntry: (entryData) => ipcRenderer.invoke('save-entry', entryData),
  
  // Function to load an entry for a specific date.
  loadEntry: (date) => ipcRenderer.invoke('load-entry', date),
  
  // Function to get a list of all dates that have an entry.
  getAllEntryDates: () => ipcRenderer.invoke('get-all-entry-dates')
});
