// This file is required by the index.html file and will
// be executed in the renderer process for that window.
const {shell, remote, ipcRenderer} = require('electron');
const {Menu, MenuItem} = remote;

(function handleWindowControls() {
    // When document has loaded, initialise
    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            init();
        }
    };

    function init() {
        let window = remote.getCurrentWindow();
		let toastTimeoutManager;
        const iframe = document.getElementById('window-iframe'),
			pictureInPictureButton = document.getElementById('picture-in-picture-button'),
			optionButton =  document.getElementById('option-button'),
			reloadButton = document.getElementById('reload-button'),
			toastDiv = document.getElementById('window-toast'),
			minButton = document.getElementById('min-button'),
            maxButton = document.getElementById('max-button'),
            restoreButton = document.getElementById('restore-button'),
            closeButton = document.getElementById('close-button'),
			overlay = document.getElementById('overlay'),
			modalCloseButton = document.getElementsByClassName('modal-close');

		// Menu
		const menu = new Menu();
		const viewMenuItem = new MenuItem({
			label: 'Zoom',
			type: 'submenu',
			submenu: [
				{
					label: 'Défaut',
					click: () => {
						iframe.setZoomFactor(0.9);
					}
				},
				{
					label: 'Normal',
					role: 'resetzoom'
				},
				{
					label: 'Agrandir',
					role: 'zoomin'
				},
				{
					label: 'Réduire',
					role: 'zoomout'
				}
			]
		});
		menu.append(viewMenuItem);
		
		const navigationMenuItem = new MenuItem({
			label: 'Navigation',
			type: 'submenu',
			submenu: [
				{
					label: 'Arrière',
					click: () => {
						if (iframe.canGoBack())
							iframe.goBack();
					}
				},
				{
					label: 'Avant',
					click: () => {
						if (iframe.canGoForward())
							iframe.goForward();
					}
				},
				{
					label: 'Recharger',
					click: () => {
						iframe.reload();
					}
				},
				{
					label: 'Défaut',
					click: () => {
						iframe.loadURL('https://oxem-quest.fr/');
					}
				}
			]
		});
		menu.append(navigationMenuItem);
		
		const updateMenuItem = new MenuItem({
			label: 'Recherche mise à jour',
			click: () => {
				ipcRenderer.send('checkForUpdatesAndNotify');
			}
		});
		menu.append(updateMenuItem);
		
		const exitMenuItem = new MenuItem({
			label: 'Quitter',
			role: 'quit'
		});
		menu.append(exitMenuItem);

		// Header
		/*pictureInPictureButton.addEventListener("click", event => {
			// Picture in Picture is not available in Electron (requestPictureInPicture) - See https://github.com/electron/electron/pull/17686
			// So create fake PiP feature
        });*/
		
		for (i = 0; i < modalCloseButton.length; i++) {
			modalCloseButton[i].addEventListener('click', event => {
				document.getElementById('changelog').classList.remove('active');
				document.getElementById('overlay').classList.remove('active');
			});
		}
		
		overlay.addEventListener('click', event => {
			document.getElementById('changelog').classList.remove('active');
			document.getElementById('overlay').classList.remove('active');
		});
		
		if (ipcRenderer.sendSync('isFirstRun')) {
			document.getElementById('changelog').classList.add('active');
			document.getElementById('overlay').classList.add('active');
		}
		
		ipcRenderer.on('toast', function(event, data) {
			clearTimeout(toastTimeoutManager);
			toastDiv.innerHTML = data.text;
			toastDiv.classList.add('active');
			
			toastTimeoutManager = setTimeout(function() {
				toastDiv.innerHTML = '';
				toastDiv.classList.remove('active');
			}, data.duration);
		});
		
		iframe.addEventListener('did-start-loading', function(e) {
			document.getElementById('webview-spinner').classList.remove('hide');
		});
		
		iframe.addEventListener('did-stop-loading', function(e) {
			document.getElementById('webview-spinner').classList.add('hide');
		});
		
		iframe.addEventListener('dom-ready', function(e) {
			// For Debug only
			// iframe.openDevTools();
			if (ipcRenderer.sendSync('isFirstRun')) {
				iframe.setZoomFactor(0.9);
			}
			
			iframe.insertCSS(`
				#chatbox #oxem-quest-desktop {
					display: none !important;
				}
			`);
		});
		
		iframe.addEventListener('new-window', function(e) {
			shell.openExternal(e.url);
		});

		optionButton.addEventListener('click', event => {
			menu.popup(remote.getCurrentWindow())
        });

		reloadButton.addEventListener('click', event => {
            iframe.reload();
        });

        minButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.minimize();
        });

        maxButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.maximize();
            toggleMaxRestoreButtons();
        });

        restoreButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.unmaximize();
            toggleMaxRestoreButtons();
        });

        // Toggle maximise/restore buttons when maximisation/unmaximisation
        // occurs by means other than button clicks e.g. double-clicking
        // the title bar:
        toggleMaxRestoreButtons();
        window.on('maximize', toggleMaxRestoreButtons);
        window.on('unmaximize', toggleMaxRestoreButtons);

        closeButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.close();
        });

        function toggleMaxRestoreButtons() {
            window = remote.getCurrentWindow();
            if (window.isMaximized()) {
                maxButton.style.display = 'none';
                restoreButton.style.display = 'flex';
            } else {
                restoreButton.style.display = 'none';
                maxButton.style.display = 'flex';
            }
        }
    }
})();