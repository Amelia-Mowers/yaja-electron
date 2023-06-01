import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImportJobData from '../functions/ImportJobData.js';

const ImportJobButton = () => {
  return (
    <>
      <Button onClick={ImportJobData} variant="outline-primary">
        Import Job Data
      </Button>
    </>
  );
};

export default ImportJobButton;
