import ConfigManager from '../utils/ConfigManager';
import IpcHandles from '../utils/IpcHandles';
import jobsDbAPI from '../utils/jobsDbAPI';

async function AddInitJobListings() {
  const ipcHandles = await IpcHandles;

  const result = await ipcHandles.GetIndeedJobListings.invokeWithCallback(
    async update => {
      console.log('GetIndeedJobListings:', update);
  
      if (update.includes('Starting Scrape Page')) {
        const cancelled = true; // Your function to check if the task should be cancelled
        return { cancelled };
      }
    },
    ConfigManager.getConfig()
  );

  if (!result.success) {
    console.error('Error with GetIndeedJobListings:', result.error);
    return;
  }

  jobsDbAPI.bulkAdd(result.data);
  
};

export default AddInitJobListings;