import React, { Component } from 'react';
import 'css/App.css';
import AppNavbar from 'menu/AppNavbar';
import {Container } from 'react-bootstrap';

class Home extends Component {
  render() {
    return (
      <div>
        <AppNavbar/>
        <Container fluid>
        </Container>
      </div>
    );
  }
}

export default Home;
