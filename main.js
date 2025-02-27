const { app, BrowserWindow } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;
let nextProcess;

app.whenReady().then(async () => {
  const isDev = (await import("electron-is-dev")).default;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (!isDev) {
    nextProcess = exec("npm run start");
  }

  setTimeout(() => {
    mainWindow.loadURL("http://localhost:3000");
  }, 3000);

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (nextProcess) nextProcess.kill();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});