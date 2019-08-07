'use strict';

const {app, BrowserWindow, shell, ipcMain} = require('electron');
const {autoUpdater} = require('electron-updater');
const path = require('path');
const firstRun = require('electron-first-run');

// Global reference to mainWindow
let mainWindow;

function createMainWindow() {
    let window = new BrowserWindow({
        width: 1600,
        height: 900,
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
    app.quit();
});

// Create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow();
	autoUpdater.checkForUpdatesAndNotify();
});

// IPC
const sendStatusToWindow = (text, duration = 3000) => {
    if (mainWindow)
        mainWindow.webContents.send('toast', {text, duration});
};

ipcMain.on('checkForUpdatesAndNotify', (event, arg) => {
	autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('isFirstRun', (event, arg) => {
	event.returnValue = firstRun();
});

// Auto Update
autoUpdater.on('checking-for-update', () => {
	sendStatusToWindow('Recherche de mise à jour...');
});

autoUpdater.on('update-available', info => {
	sendStatusToWindow('Une mise à jour est disponible.');
});

autoUpdater.on('update-not-available', info => {
	sendStatusToWindow('Pas de mise à jour.', 5000);
});

autoUpdater.on('error', err => {
	sendStatusToWindow(`Erreur pendant la mise à jour: ${err.toString()}`, 5000);
});

autoUpdater.on('download-progress', progress => {
    sendStatusToWindow(
        `Téléchargement en cours: ${progress.bytesPerSecond} - Avancement ${progress.percent}% (${progress.transferred} + '/' + ${progress.total} + )`
    );
});

autoUpdater.on('update-downloaded', info => {
    sendStatusToWindow('Téléchargement de la mise à jour fini. Installation ...');
    autoUpdater.quitAndInstall();
});