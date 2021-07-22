'use strict';
import { app, protocol, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import fetch from 'electron-fetch';
import path from 'path';
import fs from 'fs';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

function GetJSON(url: string):Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(url, { method: "GET" })
      .then(r => r.json())
      .then(b => resolve(b))
      .catch(e => reject(e));
  });
}
function GetArrayBuffer(url: string):Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(url, { method: "GET" })
      .then(r => r.arrayBuffer())
      .then(b => resolve(b))
      .catch(e => reject(e));
  });
}

// Giant Bomb
ipcMain.handle("imageapi", async(event, ...args) => {
  if(!args[0].apiKey) { return null; }
  const main = `https://www.giantbomb.com/api/search/?api_key=${args[0].apiKey}&resources=game&format=json&field_list=aliases,image&query=`;
  const url = `${main}${encodeURIComponent(args[0].name)}}`;
  return GetJSON(url);
});
ipcMain.handle("img", async(event, ...args) => GetArrayBuffer(args[0]));

// Internet Archive
ipcMain.handle("manualapi", async(event, ...args) => {
  const main = "https://archive.org/advancedsearch.php?fl[]=identifier&fl[]=title&sort[]=&sort[]=&sort[]=&rows=10&page=1&output=json&q=subject%3AGame+Manual+mediatype%3Atexts+";
  const url = `${main}${encodeURIComponent(args[0]).replace(/%20/g, "+")}`;
  return GetJSON(url);
});
ipcMain.handle("metadataapi", async(event, ...args) => {
  const main = "https://archive.org/metadata/";
  const url = `${main}${args[0]}/files`;
  return GetJSON(url);
});
ipcMain.handle("pdf", async(event, ...args) => GetArrayBuffer(`${args[0]}`));

ipcMain.handle("fileinfolder", async (event, ...args) => shell.showItemInFolder(args[0]));
ipcMain.handle("folder", async (event, ...args) => shell.openPath(args[0]));
ipcMain.handle("link", async (event, ...args) => shell.openExternal(args[0]));

ipcMain.handle("run", async (event, ...args) => await RunEmulatorReturnSecondsPlayed(args[0]));
async function RunEmulatorReturnSecondsPlayed(args: string[]): Promise<number> {
  return new Promise(resolve => {
    const cp = require("child_process");
    const file = cp.execFile(args[0], args[1]);
    const openTime = new Date();
    file.on("err", (err: any) => {
      resolve(0);
    });
    file.on("close", () => {
      const endTime = new Date();
      const secondsPassed = (endTime.getTime() - openTime.getTime()) / 1000;
      resolve(secondsPassed);
    });
  });
}

async function createWindow() {
  const userDataPath = app.getPath("userData");
  const configPath = path.join(userDataPath, "config.json");
  let fullscreen = false;
  let frame = true;
  if(fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath).toString());
    fullscreen = config.fullscreen;
    frame = config.showChrome;
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: fullscreen,
    frame: frame,
    webPreferences: {
      webSecurity: false,
      enableRemoteModule: true,
      // Use pluginOptions.nodeIntegration, leave this alone; See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  });
  win.removeMenu();
  
  ipcMain.handle("devtools", async (event, ...args) => win.webContents.openDevTools());
  ipcMain.handle("fullscreen", (e, ...args) => win.setFullScreen(args[0]));
  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    });
    return result.filePaths;
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) { // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) { win.webContents.openDevTools(); }
  } else {
    createProtocol("app"); // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") { app.quit(); }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
})

app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try { // Install Vue Devtools
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") { app.quit(); }
    })
  } else {
    process.on("SIGTERM", () => { app.quit(); });
  }
}