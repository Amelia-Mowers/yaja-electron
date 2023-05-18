import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddInitJobListings from '../functions/AddInitJobListings';

const GetListingsButton = () => {

  return (
    <>
      <Button onClick={AddInitJobListings} variant="primary">
        Get Listings
      </Button>
    </>
  );
};

export default GetListingsButton;
