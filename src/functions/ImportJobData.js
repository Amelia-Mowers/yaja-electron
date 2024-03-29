import jobsDbAPI from '../utils/jobsDbAPI';
import IpcHandles from '../utils/IpcHandles';

async function ImportJobData(){
  const ipcHandles = await IpcHandles;

  const filePaths = await ipcHandles.OpenFileDialog.invoke();
  
  if (filePaths.length === 0) {
    alert('No file selected!');
    return;
  }

  const file = filePaths[0];
  const result = await ipcHandles.ReadFile.invoke(file);

  if (!result.success) {
    console.error('Error reading file:', result.error);
    return;
  }

  result.data.forEach(j => {
    j._rev = null;
  });

  jobsDbAPI.bulkAdd(result.data);
};

export default ImportJobData;
