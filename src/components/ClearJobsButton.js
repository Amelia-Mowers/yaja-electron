import React from 'react';
import Button from 'react-bootstrap/Button';
import jobsDbAPI from '../utils/jobsDbAPI';

const ClearJobsButton = () => {

  return (
    <>
      <Button onClick={jobsDbAPI.clearDb} variant="outline-danger">
        Clear Jobs
      </Button>
    </>
  );
};

export default ClearJobsButton;
