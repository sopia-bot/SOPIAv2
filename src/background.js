'use strict'

import { app, session, protocol, BrowserWindow, ipcMain } from 'electron'
import {
	createProtocol,
	/* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1185,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: !isDevelopment,
		} ,
		show: false,
	})

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + "#/spoon/")
		console.log(process.env.WEBPACK_DEV_SERVER_URL + "#/spoon/");
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		win.loadURL('app://./index.html')
	}

	win.once('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		win = null
	})
}

ipcMain.on('test-ipc', (event) => {
	console.log("test-ipc", event.sender);
});

let isPopupedSpoon = false;
ipcMain.on('spoon-popup', (event) => {
	console.log(event);
	if ( isPopupedSpoon ) return;

	isPopupedSpoon = true;

	let subwin = new BrowserWindow({
		width: 1185,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: !isDevelopment,
		},
		show: false,
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		subwin.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		subwin.loadURL('app://./index.html')
	}

	subwin.once('ready-to-show', () => {
		event.reply('popup-spoon', { type: 'spoon', value: true });
		subwin.show();
	});

	subwin.on('closed', () => {
		subwin = null;
		isPopupedSpoon = false;
		event.reply('popup-spoon', { type: 'spoon', value: false });
	});

});

global.snsLoginOpen = function(url) {
	return new Promise((resolve, reject) => {
		const snsBrowser = new BrowserWindow({
			width: 800,
			height: 800,
			show: false,
		});

		snsBrowser.once('ready-to-show', () => {
			snsBrowser.show();
		});

		snsBrowser.once('close', (evt) => {
			const sender = evt.sender;
			const webContents = sender.webContents;

			const tout = setTimeout(() => {
				reject(new Error('Faild get localStorage data. (Timeout)'));
				evt.sender.close();
			}, 5000);
			
			webContents.executeJavaScript(`localStorage.getItem('SPOONCAST_requestBySnsLogin')`)
				.then(res => {
					resolve(res);
				})
				.catch(reject)
				.finally(() => {
					clearTimeout(tout)
					evt.sender.close();
				});

			evt.preventDefault();
		});

		snsBrowser.loadURL(url);
	});
};

global.clearSession = function() {
	return session.defaultSession.clearStorageData({
			storages: [ 'cookies', 'appcache', 'shadercache' ],
	});
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow()
	}
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		// Devtools extensions are broken in Electron 6.0.0 and greater
		// See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
		// Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
		// If you are not using Windows 10 dark mode, you may uncomment these lines
		// In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
		// try {
		//   await installVueDevtools()
		// } catch (e) {
		//   console.error('Vue Devtools failed to install:', e.toString())
		// }

	}

	await session.defaultSession.clearStorageData({
		storages: [ 'cookies', 'appcache', 'shadercache' ],
	});

	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders['User-Agent'] = "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36";
		details.requestHeaders['Accept-Encoding'] = "gzip, deflate, br";
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});
	createWindow();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', data => {
			if (data === 'graceful-exit') {
				app.quit()
			}
		})
	} else {
		process.on('SIGTERM', () => {
			app.quit()
		})
	}
}
