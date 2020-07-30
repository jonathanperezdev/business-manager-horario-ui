import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Container,
  Col,
  Form,
  Button,
  Alert,
  Modal,
  Row,
} from "react-bootstrap";
import AppNavbar from "menu/AppNavbar";
import "css/App.css";
import Constant from "common/Constant";
import axios from "axios";
import Datetime from "react-datetime";
import "css/react-datetime.css";
import HorarioDiaComponent from "common/HorarioDiaComponent";
import Moment from "moment";
import Loading from "common/Loading";

const TIME_FORMAT = Constant.TIME_FORMAT;
const DATE_FORMAT = Constant.DATE_FORMAT;
const PATH_HORARIO_EMPLEADO_SERVICE =
  Constant.HORARIO_API + Constant.HORARIO_EMPLEADO_SERVICE;

class EditarHorarioEmpleado extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      errors: {},
      horarioEmpleado: {},
      formState: "",
      modal: false,
    };
  } 

  componentDidMount() {
    this.setState({ isLoading: true });

    let { params } = this.props.match;
    this.loadHorarioEmpleado(
      PATH_HORARIO_EMPLEADO_SERVICE+params.idEmpleado+'/semana/'+params.idSemana
    );
  }

  loadHorarioEmpleado = (pathService) => {
    axios
      .get(pathService)
      .then((result) => {        
        this.setState({ horarioEmpleado: result.data, isLoading: false });
      })
      .catch((error) =>
        this.setState({
          error,
          formState: "error",
          isLoading: false,
          modal: false,
        })
      );
  };

  save = async () => {
    let { horarioEmpleado } = this.state;
    let { params } = this.props.match;

    this.setState({ isLoading: true });
    alert(PATH_HORARIO_EMPLEADO_SERVICE+'/'+params.idEmpleado+'/semana/'+params.idSemana)
    await axios({
      method: "PUT",
      url: PATH_HORARIO_EMPLEADO_SERVICE+params.idEmpleado+'/semana/'+params.idSemana,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify(horarioEmpleado),
    }).then((result) => {                
        this.setState({
          isLoading: false,
          formState: "success",
          horarioEmpleado: result.data,
          modal: false,
        });
    }).catch((error) =>
        this.setState({
          error,
          formState: "error",
          isLoading: false,
      })
    );
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal,
    });
  };

  handleTime = (date, dia, field) => {
    let { horarioEmpleado } = this.state;
    let diaSemana = horarioEmpleado[dia];
    
    let fecha = Moment(diaSemana[field]).format(DATE_FORMAT);
    let hora = Moment(date).format(TIME_FORMAT);
    diaSemana[field] = fecha + "T" + hora;

    let fechaInicio = Moment(diaSemana.fechaInicio);
    let fechaFin = Moment(diaSemana.fechaFin);
    diaSemana.horas = Moment.duration(fechaFin.diff(fechaInicio)).asHours();

    this.setState({ horarioEmpleado });
  };

  regresar = (idPeriodoPago) => {
    let path = `/horarioEmpleado/${idPeriodoPago}`;
    this.props.history.push(path);
  };

  render() {
    const {      
      isLoading,
      error,      
      formState,      
      horarioEmpleado,
    } = this.state;    

    let { params } = this.props.match;

    if (isLoading) {
      return <Loading />;
    }

    let messageLabel;
    if (formState == "error") {
      messageLabel = (<Alert variant="danger">{error.response.data.message}</Alert>);
    } else if (formState == "success") {
      messageLabel = (<Alert variant="success">El Horario del empleado se guardo satisfactoriamente</Alert>);
    }    

    const modal = (
      <Modal show={this.state.modal} onClick={this.toggle} className={this.props.className}>        
      <Modal.Header onClick={this.toggle}>Confirmar Guardar Horario Empleado</Modal.Header>
        <Modal.Body>
          Esta seguro de guardar el horario para el empleado
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={this.save}>
            Guardar
          </Button>{" "}
          <Button variant="outline-secondary" onClick={this.toggle}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    );

    return (
      <div>
        {modal}
        <AppNavbar />
        <Container className="App">
          <h2 className='App-title'>Editar Horario Empleado</h2>
          <Form className="form">
            <Col>
              <Container className="App">
                <h5>Empleado</h5>
                <Row>
                 <Col sm="2">
                    <Form.Control readOnly placeholder={horarioEmpleado.empleado.id} />                    
                  </Col>
                  <Col sm="4">
                    <Form.Control readOnly placeholder={horarioEmpleado.empleado.nombres +' '+ horarioEmpleado.empleado.apellidos} />                    
                  </Col>                  
                </Row>
              </Container>
            </Col>
            <Col>
              <Container className="App">
                <Row>
                  <Col>
                    <h5>Horario Semana</h5>
                  </Col>
                </Row>
                <Row>
                  <Col xs={2}></Col>
                  <Col xs={3}><h5>Hora Inicio</h5></Col>                  
                  <Col xs={3}><h5>Hora Fin</h5></Col>                  
                  <Col xs={1}><h5>Horas</h5></Col>
                  <Col xs={3}><h5>Recargos</h5></Col>
                </Row>                
                <Row>
                  <Col>
                    <HorarioDiaComponent
                      handleTime={this.handleTime}
                      dia="lunes"
                      fields={this.state.horarioEmpleado}
                    />
                  </Col>
                </Row>
                <Row>                
                  <Col>
                    <HorarioDiaComponent
                      handleTime={this.handleTime}
                      dia="martes"
                      fields={this.state.horarioEmpleado}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <HorarioDiaComponent
                      handleTime={this.handleTime}
                      dia="miercoles"
                      fields={this.state.horarioEmpleado}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <HorarioDiaComponent
                      handleTime={this.handleTime}
                      dia="jueves"
                      fields={this.state.horarioEmpleado}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <HorarioDiaComponent
                      handleTime={this.handleTime}
                      dia="viernes"
                      fields={this.state.horarioEmpleado}
                    />
                  </Col>
                </Row>
                <Row>
                <Col>
                  <HorarioDiaComponent
                    handleTime={this.handleTime}
                    dia="sabado"
                    fields={this.state.horarioEmpleado}
                  />
                </Col>
                </Row>
                <Row>
                <Col>
                  <HorarioDiaComponent
                    handleTime={this.handleTime}
                    dia="domingo"
                    fields={this.state.horarioEmpleado}
                  />
                </Col>
                </Row>
              </Container>
            </Col>
            <Col>
              <Form.Group>
                <Button variant="outline-primary" onClick={this.toggle}>Guardar</Button>{"    "}
                <Button variant="outline-primary" onClick={(idPeriodoPago) => this.regresar(params.idPeriodoPago)}>Regresar</Button>{"    "}
              </Form.Group>
            </Col>
            <Col>{messageLabel}</Col>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withRouter(EditarHorarioEmpleado);
