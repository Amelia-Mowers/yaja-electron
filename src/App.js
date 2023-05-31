import JobsTable from './components/JobsTable';
import AddTestJobButton from './components/AddTestJobButton';
import ClearJobsButton from './components/ClearJobsButton';
import ImportJobButton from './components/ImportJobButton';
import GetListingsButton from './components/GetListingsButton';
import SettingsMenuButton from './components/SettingsMenuButton';
import SettingsModal from './components/SettingsModal';
import ProgressModal from './components/ProgressModal';
import JobDetails from './components/JobDetails';

import './App.scss';

function App() {
  return (
    <div className="App bg-light">
        <SettingsModal />
        <ProgressModal />
        <header className="header">  
          <SettingsMenuButton />
          <AddTestJobButton />
          <GetListingsButton />
          <ImportJobButton />
          <ClearJobsButton />
        </header>
        <main className="main-div">
          <div className="table-div">
            <JobsTable />
          </div>
          <div className="detail-div">
            <JobDetails />
          </div>
        </main>
    </div>
  );
}

export default App;
