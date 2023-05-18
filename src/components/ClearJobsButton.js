import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import jobsDbAPI from '../utils/jobsDbAPI';

const ClearJobsButton = () => {

  return (
    <div>
      <Button onClick={jobsDbAPI.clearDb} variant="danger">
        Clear Jobs
      </Button>
    </div>
  );
};

export default ClearJobsButton;
