import JobsTable from './components/JobsTable';
import AddTestJobButton from './components/AddTestJobButton';
import ClearJobsButton from './components/ClearJobsButton';
import ImportJobButton from './components/ImportJobButton';
import GetListingsButton from './components/GetListingsButton';
import SettingsMenuButton from './components/SettingsMenuButton';
import SettingsModal from './components/SettingsModal';
import ProgressModal from './components/ProgressModal';

import './App.scss';

function App() {
  return (
    <div className="App bg-light">
        <SettingsModal />
        <ProgressModal />
        <div className="header">
          <div className="left-spacer"></div>
          <div className="action-buttons"> 
            <SettingsMenuButton />  
            <AddTestJobButton />
            <GetListingsButton />
            <ImportJobButton />
            <ClearJobsButton />
          </div>
          <div className="right-spacer"></div>
        </div>
        <div className="main-div">
          <div className="table-div">
            <JobsTable />
          </div>
        </div>
    </div>
  );
}

export default App;
