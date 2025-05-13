const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.on("ready", () => {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Asegúrate de que esta ruta sea correcta
    },
  });

  mainWindow.loadURL("http://localhost:3000"); // O la URL de tu aplicación
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
