// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Use contextBridge to securely expose APIs from the main process 
// to the renderer process.
contextBridge.exposeInMainWorld('electronAPI', {
  // --- Diary Entry Functions ---
  
  // Expose a function to save a diary entry.
  // It sends the entry data to the main process via an IPC channel.
  saveEntry: (entry) => ipcRenderer.invoke('save-entry', entry),
  
  // Expose a function to load a diary entry for a specific date.
  loadEntry: (date) => ipcRenderer.invoke('load-entry', date),
  
  // Expose a function to get a list of all dates that have entries.
  getAllEntryDates: () => ipcRenderer.invoke('get-all-entry-dates')
});
