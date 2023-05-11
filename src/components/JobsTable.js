import React, { useState, useEffect } from 'react';
import jobs_db from '../utils/jobs_db';

const columnDefs = [
  { header: <>#</>, format: (_, index) => index + 1 },
  { header: <>Title</>, format: job => job.title || 'Missing' },
  { header: <>Company</>, format: job => job.companyName || 'Missing' },
  { header: <>Salary <br/> (Min)</>, format: job => job.salaryEqMin ? `$${job.salaryEqMin}` : 'Missing' },
  { header: <>Internal <br/> Apply?</>, format: job => job.applyAt === 'Internal' ? 'Yes' : 'No' },
  { header: <>Exp <br/> (Years)</>, format: job => job.yearsOfExpRequired || 'Missing' },
  { header: <>Remote</>, format: job => job.Remote ? 'Yes' : 'No' },
];

function JobsTable() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDocs = await jobs_db.allDocs({ include_docs: true });
        // console.log('All Docs:', allDocs);
        setJobs(allDocs.rows.map(row => row.doc));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Listen for changes in the database
    const changes = jobs_db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', (change) => {
      // Update the state when the database changes
      fetchData();
    }).on('error', (err) => {
      console.error('Error listening for changes:', err);
    });

    // Clean up the changes listener when the component is unmounted
    return () => {
      changes.cancel();
    };

  }, []);

  // Render the table using the jobs state

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

    return jobs.map((job, index) => (
      <tr key={index}>
        {columnDefs.map(col => (
          <td key={col._id}>{col.format(job, index)}</td>
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