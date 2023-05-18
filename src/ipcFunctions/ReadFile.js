const jsonfile = require('jsonfile');

async function ReadFile(sendUpdate, filePath) {
  try {
    const jobDataArray = await jsonfile.readFile(filePath);
    return { success: true, data: jobDataArray };
  } catch (err) {
    console.error('Error reading file:', err);
    return { success: false, error: err };
  }
}

module.exports = ReadFile;
