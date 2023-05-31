import React, { useState, useEffect } from 'react';
import jobsDbAPI from '../utils/jobsDbAPI';
import eventBus from '../utils/eventBus';

const columnDefs = [
  { header: <>#</>, format: (_, index) => index + 1 },
  { header: <>Title</>, format: job => job.title || 'Missing' },
  { header: <>Company</>, format: job => job.companyName || 'Missing' },
  { header: <>Salary <br/> (Min)</>, format: job => job.salaryEqMin ? `$${Math.floor(job.salaryEqMin)}` : 'Missing' },
  { header: <>Internal <br/> Apply?</>, format: job => job.applyAt === 'Internal' ? 'Yes' : 'No' },
  { header: <>Exp <br/> (Years)</>, format: job => job.yearsOfExpRequired || 'Missing' },
  { header: <>Remote</>, format: job => job.Remote ? 'Yes' : 'No' },
];

function JobsTable() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDocs = await jobsDbAPI.getAllJobs();
        // console.log('All Docs:', allDocs);
        setJobs(allDocs.rows.map(row => row.doc));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    let changes;
    
    const updateChanges = () => {
      // Dispose of the existing changes listener
      if (changes) {
        changes.cancel();
      }
  
      // Create a new changes listener
      changes = jobsDbAPI.getDb().changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        // Update the state when the database changes
        fetchData();
      }).on('error', (err) => {
        console.error('Error listening for changes:', err);
      });

      fetchData();
    };

    // Initialize the changes listener
    updateChanges();

    // Listen for the dbCleared event and update the changes listener when it happens
    const onDbCleared = (event) => {
      updateChanges();
    };
    window.addEventListener('dbCleared', onDbCleared);

    // Clean up the event listener when the component is unmounted
    return () => {
      if (changes) {
        changes.cancel();
      }
      window.removeEventListener('dbCleared', onDbCleared);
    };
  }, []);

  const onJobRowClick = (job) => {
    eventBus.jobSelected.publish(job._id);
  };

  const renderTableData = () => {
    if (jobs.length === 0) {
      return (
        <tr>
          <td align="center" colSpan={columnDefs.length}>
            No jobs data available.
          </td>
        </tr>
      );
    }

    return jobs.map((job, rowIndex) => (
      <tr key={rowIndex} onClick={() => onJobRowClick(job)}>
        {columnDefs.map((col, colIndex) => (
          <td key={`${rowIndex}-${colIndex}`}>{col.format(job, rowIndex)}</td>
        ))}
      </tr>
    ));
      
  };

  return (
    <table>
      <thead>
        <tr>
          {columnDefs.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{renderTableData()}</tbody>
    </table>
  );
}

export default JobsTable;