import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import ClearJobs from '../nodeScripts/ClearJobs.js';

const ClearJobsButton = () => {

  return (
    <div>
      <Button onClick={ClearJobs} variant="danger">
        Clear Jobs
      </Button>
    </div>
  );
};

export default ClearJobsButton;
