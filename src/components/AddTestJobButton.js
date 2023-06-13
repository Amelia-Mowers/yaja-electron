import React from 'react';
import Button from 'react-bootstrap/Button';
import AddTestJob from '../functions/AddTestJob.js';

const AddTestJobButton = () => {

  return (
    <>
      <Button onClick={AddTestJob} variant="outline-primary">
        Add Test Job
      </Button>
    </>
  );
};

export default AddTestJobButton;
