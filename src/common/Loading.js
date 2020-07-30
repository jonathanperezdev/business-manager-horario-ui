import React from 'react';
import {Spinner} from 'react-bootstrap';

const Loading = () => {
  return (    
    <div>
      <Spinner animation="grow" variant="info" />
      <Spinner animation="grow" variant="info" />
      <Spinner animation="grow" variant="info" />
    </div>
  );
}

export default Loading;
