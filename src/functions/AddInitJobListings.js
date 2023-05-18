import config from '../utils/config';
import IpcHandles from '../utils/IpcHandles';
import jobsDbAPI from '../utils/jobsDbAPI';

async function AddInitJobListings() {
  const ipcHandles = await IpcHandles;

  console.log(config);

  const result = await ipcHandles.GetIndeedJobListings(config);

  console.log(result);

  if (!result.success) {
    console.error('Error with GetIndeedJobListings:', result.error);
    return;
  }

  jobsDbAPI.bulkAdd(result.data);
  
};

export default AddInitJobListings;