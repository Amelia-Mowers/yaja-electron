import './App.css';
import JobsTable from './components/JobsTable';
import AddTestJobButton from './components/AddTestJobButton';
import ClearJobsButton from './components/ClearJobsButton';

function App() {
  return (
    <div className="App">
        <div className="header">
          <div className="left-spacer"></div>
          <div className="action-buttons"> 
            <AddTestJobButton className="action-button"/>
            <ClearJobsButton className="action-button"/>
          </div>
          <div className="right-spacer"></div>
        </div>
      <JobsTable />
    </div>
  );
}

export default App;
