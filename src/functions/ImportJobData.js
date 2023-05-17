import jobs_db from '../utils/jobs_db';
import IpcHandles from '../utils/IpcHandles';

const ImportJobData = async () => {
  const ipcHandles = await IpcHandles();

  const filePaths = await ipcHandles.OpenFileDialog();
  
  if (filePaths.length === 0) {
    alert('No file selected!');
    return;
  }

  const file = filePaths[0];
  const result = await ipcHandles.ReadFile(file);

  if (!result.success) {
    console.error('Error reading file:', result.error);
    return;
  }

  result.data.forEach(j => {
    j._rev = null;
  });

  jobs_db.bulkDocs(result.data);
};

export default ImportJobData;
