import jobs_db from '../utils/jobs_db';

const ImportJobData = async () => {
  const filePaths = await window.electron.invoke('open-file-dialog');
  
  if (filePaths.length === 0) {
    alert('No file selected!');
    return;
  }

  const file = filePaths[0];
  const result = await window.electron.invoke('read-file', file);

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
