import JobsTable from './components/JobsTable';
import AddTestJobButton from './components/AddTestJobButton';
import ClearJobsButton from './components/ClearJobsButton';
import './App.scss';

function App() {
  return (
    <div className="App bg-light">
        <div className="header">
          <div className="left-spacer"></div>
          <div className="action-buttons"> 
            <AddTestJobButton className="action-button"/>
            <ClearJobsButton className="action-button"/>
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