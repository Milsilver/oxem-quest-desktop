'use strict';

const {app, BrowserWindow, shell, ipcMain} = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Global reference to mainWindow
let mainWindow;

function createMainWindow() {
    let window = new BrowserWindow({
        width: 1080,
        height: 720,
        frame: false,
		icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
			webviewTag: true,
            nodeIntegration: true
        }
    });
    
    window.setMenu(null);
    window.loadFile(path.join(__dirname, 'renderer/index.html'));
	
    // Uncomment to use Chrome developer tools
    // window.webContents.openDevTools();
	
    // Cleanup when window is closed
    window.on('closed', function() {
        window = null;
    });

    return window;
}

// Setup application - For PiP
// app.commandLine.appendSwitch('disable-site-isolation-trials');

// Quit application when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () => {
    // On macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null)
        mainWindow = createMainWindow();
});

// Create main BrowserWindow when electron is ready
app.on('ready', () => {
	autoUpdater.checkForUpdatesAndNotify();
    mainWindow = createMainWindow();
});

// IPC
ipcMain.on('checkForUpdatesAndNotify', (event, arg) => {
	autoUpdater.checkForUpdatesAndNotify();
});

// Auto Update
autoUpdater.on('update-downloaded', info => {
	autoUpdater.quitAndInstall();
});