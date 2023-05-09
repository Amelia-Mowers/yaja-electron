import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddTestJob from '../nodeScripts/AddTestJob.js';

const AddTestJobButton = () => {

  return (
    <div>
      <Button onClick={AddTestJob} variant="primary">
        Add Test Job
      </Button>
    </div>
  );
};

export default AddTestJobButton;
