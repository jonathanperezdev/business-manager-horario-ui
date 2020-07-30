import React, { Component } from "react";
import { Form, Col, Row, Toast, Button, ListGroup, ListGroupItem} from 'react-bootstrap';
import Constant from "common/Constant";
import Datetime from "react-datetime";
import Moment from 'moment';

const TIME_FORMAT = Constant.TIME_FORMAT;
const DATE_FORMAT = Constant.DATE_FORMAT;

class HorarioDiaComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {showRecargos: false};
  }  

  toggle = () => {
    this.setState({
      showRecargos: !this.state.showRecargos,
    });
  };

  render() {
    let {handleTime, dia, fields} = this.props;
    const {showRecargos} = this.state;

    let diaHorario = fields[dia];

    let fechaInicio = diaHorario ? Moment(diaHorario.fechaInicio).format(DATE_FORMAT) : '';
    let horaInicio = diaHorario ? Moment(diaHorario.fechaInicio).format(TIME_FORMAT) : null;

    let fechaFin = diaHorario ? Moment(diaHorario.fechaFin).format(DATE_FORMAT) : '';
    let horaFin = diaHorario ? Moment(diaHorario.fechaFin).format(TIME_FORMAT) : null;

    let toastRecargos = '';
    if(diaHorario) {
      toastRecargos = (
        <Toast show={showRecargos} onClose={this.toggle}>
          <ListGroup variant="flush">
            {diaHorario.detalleRecargos.map((detalle) => (
              <ListGroup.Item size='sm'><small>{detalle}</small></ListGroup.Item>        
            ))}            
        </ListGroup>        
      </Toast>
      );   
    }

    return (      
      <Row>
        <Col xs={2}>          
          <h5>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h5>
        </Col>
        <Col xs={3}>
          <Form.Group>            
            <Row>
              <Col>
                <Form.Control
                  disabled
                  value={fechaInicio}/>
              </Col>
              <Col sm="5">
                <Datetime
                  dateFormat={false}
                  timeFormat={TIME_FORMAT}
                  inputProps={{readOnly:true, disabled: !horaInicio}}
                  value={horaInicio}                  
                  onChange={e => {
                    handleTime(e, dia, "fechaInicio");
                  }}
                  />
              </Col>
            </Row>
          </Form.Group>
        </Col>
        <Col xs={3}>
          <Form.Group>            
              <Row>
                <Col>
                  <Form.Control
                    disabled
                    value={fechaFin}/>
                </Col>
                <Col sm="5">
                  <Datetime
                    dateFormat={false}
                    timeFormat={TIME_FORMAT}
                    inputProps={{readOnly:true, disabled: !horaFin}}
                    value={horaFin}                    
                    onChange={e => {
                      handleTime(e, dia, "fechaFin");
                    }}
                    />
                </Col>
              </Row>
          </Form.Group>
        </Col>
        <Col xs={1}>          
          <Form.Control
            disabled
            value={diaHorario ? diaHorario.horas : 0}/>
        </Col>
        <Col xs={3}>
          <Button  variant="outline-primary" onClick={this.toggle}>Mostrar Recargos</Button>
          {toastRecargos}
        </Col>        
      </Row>
    );
  }
}

export default HorarioDiaComponent;
