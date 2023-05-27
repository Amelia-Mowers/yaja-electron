import ConfigManager from '../utils/ConfigManager';
import IpcHandles from '../utils/IpcHandles';
import jobsDbAPI from '../utils/jobsDbAPI';
import EventBus from '../utils/eventBus';

async function AddInitJobListings() {
  const ipcHandles = await IpcHandles;

  EventBus.JobListingsProgressUpdate.publish({
    message: 'Starting job listings',
    progress: 0
  });

  const result = await ipcHandles.GetIndeedJobListings.invokeWithCallback(
    async update => {
      EventBus.JobListingsProgressUpdate.publish({
        message: update.message,
        progress: update.progress,
        final: update.final
      });

      return { cancelled: false }
    },
    ConfigManager.getConfig()
  );

  if (!result.success) {
    console.error('Error with GetIndeedJobListings:', result.error);
    EventBus.JobListingsProgressUpdate.publish({
      message: `Error: ${result.error}`,
      progress: 100,
      final: true
    });
    return;
  }

  jobsDbAPI.bulkAdd(result.data);
  EventBus.JobListingsProgressUpdate.publish({
    message: 'Finished adding job listings',
    progress: 100,
    final: true
  });
};

export default AddInitJobListings;
