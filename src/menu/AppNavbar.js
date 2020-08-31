import React, { Component } from 'react';
import { Navbar, NavDropdown} from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class AppNavbar extends Component {
  render() {
    return (
      <Navbar bg="primary" variant="dark">
        <Navbar.Brand href="/">          
          <img
            alt=""
            src="/Aurora.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          Business Manager
        </Navbar.Brand>        
        <NavDropdown title="Menu">
          <NavDropdown.Item href="/parametros">Parametros</NavDropdown.Item>
          <NavDropdown.Item href="/festivos">Festivos</NavDropdown.Item>
          <NavDropdown.Item href="/horarioUbicacion">Horario Ubicacion</NavDropdown.Item>
          <NavDropdown.Item href="/periodoPago">Periodo de Pago</NavDropdown.Item>
        </NavDropdown>        
      </Navbar>
    );
  }  
}
