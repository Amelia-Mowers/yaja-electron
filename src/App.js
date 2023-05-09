import logo from './logo.svg';
import './App.css';
import JobsTable from './components/JobsTable';
import AddTestJobButton from './components/AddTestJobButton';

function App() {
  return (
    <div className="App">
      <AddTestJobButton />
      <JobsTable />
    </div>
  );
}

export default App;
