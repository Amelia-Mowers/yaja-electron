const { dialog } = require('electron');

async function OpenFileDialog() {
    const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'json', extensions: ['json'] }] });
    return filePaths;
}

module.exports = OpenFileDialog;