import React, { useState, useEffect } from 'react';
import { ButtonGroup, Dropdown, Button, DropdownButton } from 'react-bootstrap';
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
  const [sortProperty, setSortProperty] = useState(null);
  const [sortDirection, setSortDirection] = useState(false);
  const [sortProperties, setSortProperties] = useState([]);

  useEffect(() => {
    const fetchSortProperties = async () => {
      try {
        const fetchedSortProperties = await jobsDbAPI.getSortProperties();
        setSortProperties(fetchedSortProperties);
      } catch (error) {
        console.error('Error fetching sort properties:', error);
      }
    };

    fetchSortProperties();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedJobs;
        if (sortProperty) {
          fetchedJobs = await jobsDbAPI.getSortedJobs(sortProperty, sortDirection);
        } else {
          fetchedJobs = await jobsDbAPI.getAllJobs();
        }
  
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  
    const dbChangeUnsubscribe = eventBus.dbChange.subscribe(() => {
      fetchData();
    });
  
    return () => {
      dbChangeUnsubscribe();
    };
  }, [sortProperty, sortDirection]);

  const handleSortChange = (selectedSort) => {
    setSortProperty(selectedSort === 'none' ? null : selectedSort);
  };

  const toggleSortDirection = () => {
    setSortDirection(!sortDirection);
  };

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
    <>
      <div className="toolbar">
        <ButtonGroup>
          <DropdownButton as={ButtonGroup} variant='outline-secondary' title= {sortProperty || "None"} onSelect={handleSortChange}>
            <Dropdown.Item eventKey="none">None</Dropdown.Item>
            {sortProperties.map((sortProperty, index) => (
              <Dropdown.Item key={index} eventKey={sortProperty}>{sortProperty}</Dropdown.Item>
            ))}
          </DropdownButton >
          <Button variant="outline-secondary" onClick={toggleSortDirection} disabled={!sortProperty}>
            {sortDirection ? '▲' : '▼'}
          </Button>
        </ButtonGroup>
      </div>
      <div className="table">
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
      </div>
    </>
  );
}

export default JobsTable;
