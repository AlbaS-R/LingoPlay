const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Exponer funciones o datos al renderer process si es necesario
});
