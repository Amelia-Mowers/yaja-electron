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
            ipcMain.handle(fileNameWithoutExt, func);
            functions.push(fileNameWithoutExt);
        }
    }
});

function ipcFunctionNames() {
    return functions;
}

ipcMain.handle('IpcFunctionNames', ipcFunctionNames);