import React from 'react';
import Button from 'react-bootstrap/Button';
import AddInitJobListings from '../functions/AddInitJobListings';

const GetListingsButton = () => {

  return (
    <>
      <Button onClick={AddInitJobListings} variant="outline-primary">
        Get Listings
      </Button>
    </>
  );
};

export default GetListingsButton;
