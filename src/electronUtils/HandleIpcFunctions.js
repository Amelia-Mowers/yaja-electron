const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path');

const scriptsPath = path.join(appRoot.path, './src/ipcFunctions');

let functions = [];

fs.readdirSync(scriptsPath).forEach(file => {
    if (path.extname(file) === '.js') {
      const fileNameWithoutExt = path.basename(file, '.js');
      const func = require(path.join(scriptsPath, file));
      if (typeof func === 'function') {
        ipcMain.handle(fileNameWithoutExt, async (event, ...args) => {
          const tools = {
            sendUpdate: (update) => {
              event.sender.send(fileNameWithoutExt + '-update', update);
            },
            sendUpdateWithResponse: async (update) => {
              event.sender.send(fileNameWithoutExt + '-update', update);
              return new Promise((resolve) => {
                ipcMain.once(fileNameWithoutExt + '-update-response', (event, response) => {
                  resolve(response);
                });
              });
            }
          };
          return func(tools, ...args);
        });
        functions.push(fileNameWithoutExt);
      }
    }
  });

function ipcFunctionNames() {
    return functions;
}

ipcMain.handle('IpcFunctionNames', ipcFunctionNames);