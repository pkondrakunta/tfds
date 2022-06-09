'use strict';



const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} = require('electron')
// require('electron-reload')(__dirname);


function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('index.html');
}

Menu.setApplicationMenu(null);
app.on('ready', createWindow)

ipcMain.on('online-status-changed', (event, status) => {
  console.log("internet connectivity status: " + status);
  if (status == "offline") {
    const opt = {
      title: "Lost Connectivity",
      message: "The internet? Is that thing still around?"
    }
    const response = dialog.showMessageBox(null, opt)
  }
})
