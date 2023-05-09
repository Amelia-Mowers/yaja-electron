import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

const GetListings = nw.require('../nodeScripts/GetListings.js');

const GetListingsButton = () => {

  return (
    <div>
      <Button onClick={GetListings} variant="primary">
        Get Listings
      </Button>
    </div>
  );
};

export default GetListingsButton;
