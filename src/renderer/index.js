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
        const iframe = document.getElementById('window-iframe'),
			pictureInPictureButton = document.getElementById('picture-in-picture-button'),
			optionButton =  document.getElementById('option-button'),
			reloadButton = document.getElementById('reload-button'),
			minButton = document.getElementById('min-button'),
            maxButton = document.getElementById('max-button'),
            restoreButton = document.getElementById('restore-button'),
            closeButton = document.getElementById('close-button');

		// Menu
		const menu = new Menu();
		const viewMenuItem = new MenuItem({
			label: 'Zoom',
			type: 'submenu',
			submenu: [
				{
					label: 'Défaut',
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
		
		iframe.addEventListener('dom-ready', function(e) {
			// For Debug only
			// iframe.openDevTools();
			
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