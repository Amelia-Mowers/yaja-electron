import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import jobsDbAPI from '../utils/jobsDbAPI';

const ClearJobsButton = () => {

  return (
    <>
      <Button onClick={jobsDbAPI.clearDb} variant="danger">
        Clear Jobs
      </Button>
    </>
  );
};

export default ClearJobsButton;
