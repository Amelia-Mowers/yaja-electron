import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import jobs_db from '../utils/jobs_db';

function JobsTable() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDocs = await jobs_db.allDocs({ include_docs: true });
        console.log('All Docs:', allDocs);
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
  // ...

  const renderTableData = () => {
    if (jobs.length === 0) {
        return (
          <tr>
            <td colSpan="7" className="text-center">
              No jobs data available.
            </td>
          </tr>
        );
      }

    return jobs.map((job, index) => {
      const {
        title,
        companyName,
        salaryEqMin,
        applyAt,
        yearsOfExpRequired,
        Remote
      } = job;

      return (
        <tr key={index}>
          <th>{index + 1}</th>
          <td>{title || 'Missing'}</td>
          <td>{companyName || 'Missing'}</td>
          <td>{salaryEqMin ? `$${salaryEqMin}` : 'Missing'}</td>
          <td>{applyAt === 'Internal' ? 'Yes' : 'No'}</td>
          <td>{yearsOfExpRequired || 'Missing'}</td>
          <td>{Remote ? 'Yes' : 'No'}</td>
        </tr>
      );
    });
  };

  return (
    <table>
      <thead className='table-hover'>
        <tr className="table-header-row">
          <th>#</th>
          <th>Title</th>
          <th>Company</th>
          <th>Salary <br /> (Min)</th>
          <th>Internal <br /> Apply?</th>
          <th>Exp <br /> (Years)</th>
          <th>Remote</th>
        </tr>
      </thead>
      {/* <div className="table-body-container"> */}
        <tbody>{renderTableData()}</tbody>
      {/* </div> */}
    </table>
  );
}

export default JobsTable;