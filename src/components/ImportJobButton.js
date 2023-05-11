import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImportJobData from '../functions/ImportJobData.js';

const ImportJobButton = () => {
  return (
    <div>
      <Button onClick={ImportJobData} variant="primary">
        Import Job Data
      </Button>
    </div>
  );
};

export default ImportJobButton;
