import React, { Component } from 'react';
import { Container, Col, Form, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Row} from 'reactstrap';
import AppNavbar from 'menu/AppNavbar';
import 'css/App.css';
import Constant from 'common/Constant';
import axios from 'axios';
import {validateRequired} from 'common/Validator';
import Datetime from "react-datetime";
import 'css/react-datetime.css';
import HorarioDiaComponent from 'common/HorarioDiaComponent';
import Moment from 'moment';
import Loading from 'common/Loading';

const TIME_FORMAT = Constant.TIME_FORMAT;
const DATE_FORMAT = Constant.DATE_FORMAT;
const DATE_TIME_FORMAT = Constant.DATE_TIME_FORMAT;
const PATH_PERIODO_PAGO_SERVICE = Constant.HORARIO_API+Constant.PERIODO_PAGO_SERVICE;
const PATH_DIAS_SERVICE = PATH_PERIODO_PAGO_SERVICE+'semana/dias';

class EditarHorarioEmpleado extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      errors: {},
      fields: {},
      formState: '',
      modal: false
    };
  }

  componentDidMount() {
    this.setState({isLoading: true});

    let {params} = this.props.match;
    this.loadHorarioEmpleado(PATH_PERIODO_PAGO_SERVICE+params.idEmpleado+'/'+params.idUbicacion+'/'+params.idSemana);
  }

  loadHorarioEmpleado = (pathService) => {
    axios.get(pathService)
      .then(result => {
        let fields = this.state;
        fields.horarioSemana = result.data.horarioSemana;

        this.setState({ fields: result.data, isLoading: false});
      })
      .catch(error =>
        this.setState({
          error,
          formState: "error",
          isLoading: false,
          modal: false
        })
      );
  }

  save = async () => {
    let {fields} = this.state;

    this.setState({ isLoading: true });

    await axios({
      method: "POST",
      url: PATH_DIAS_SERVICE,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      data: JSON.stringify(fields)
    }).then(result => {
      let {fields} = this.state;
      fields.horarioSemana = result.data.horarioSemana;
      this.setState({ isLoading: false, formState: 'success', fields: fields, modal:false});
    }).catch(error =>
      this.setState({
        error,
        formState: "error",
        isLoading: false
      })
    );
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  handleTime = (date, dia, field) => {
    let {fields } = this.state;
    let diaSemana = fields.horarioSemana[dia];
    diaSemana.modified = true;

    let fecha = Moment(diaSemana[field]).format(DATE_FORMAT);
    let hora = Moment(date).format(TIME_FORMAT);
    diaSemana[field] = fecha+'T'+hora;

    this.setState({ fields });
  };

  render() {
    const {festivos, isLoading, error, isExistData, errors, formState, anos, fields } = this.state;

    let messageError;
    if (formState == 'error') {
      messageError = <Alert variant="danger">{error.response.data.message}</Alert>;
    }else if(formState == 'success'){
      messageError = <Alert variant="success">El Horario del empleado se guardo satisfactoriamente</Alert>;
    }

    if (isLoading) {
      return  <Loading/>
    }

    const modal = <Modal show={this.state.modal} onClick={this.toggle} className={this.props.className}>
                    <ModalHeader onClick={this.toggle}>Confirmar Guardar Horario Empleado</ModalHeader>
                      <ModalBody>
                        Esta seguro de guardar el horario para el empleado
                      </ModalBody>
                      <ModalFooter>
                        <Button variant="outline-primary" onClick={this.save}>Guardar</Button>{' '}
                        <Button variant="outline-secondary" onClick={this.toggle}>Cancelar</Button>
                      </ModalFooter>
                    </Modal>;

    return (
      <div>
        {modal }
        <AppNavbar/>
        <Container className="App">
          <h2>Editar Horario Empleado</h2>
          <Form className="form">
            <Col>
              <Container className="App">
                <h5>Empleado</h5>
                  <Row>
                    <Col sm="2">
                      <FormGroup>
                        <Label>Id</Label>
                        <Input
                          disabled
                          value={fields.empleado.id}/>
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label>Nombres</Label>
                        <Input
                          disabled
                          value={fields.empleado.nombres}/>
                      </FormGroup>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Label>Apellidos</Label>
                        <Form.Control
                          disabled
                          value={fields.empleado.apellidos}/>
                      </Form.Group>
                    </Col>
                  </Row>
              </Container>
            </Col>
            <Col>
              <Container className="App">
                <h5>Horario Semana</h5>
                <Col>
                  <HorarioDiaComponent handleTime={this.handleTime} dia='lunes' fields={this.state.fields}/>
                </Col>
                <Col>
                  <HorarioDiaComponent handleTime={this.handleTime} dia='martes' fields={this.state.fields}/>
                </Col>
                <Col>
                  <HorarioDiaComponent handleTime={this.handleTime} dia='miercoles' fields={this.state.fields}/>
                </Col>
                <Col>
                  <HorarioDiaComponent handleTime={this.handleTime} dia='jueves' fields={this.state.fields}/>
                </Col>
                <Col>
                  <HorarioDiaComponent handleTime={this.handleTime} dia='viernes' fields={this.state.fields}/>
                </Col>
                <Col>
                  <HorarioDiaComponent handleTime={this.handleTime} dia='sabado' fields={this.state.fields}/>
                </Col>
                <Col>
                  <HorarioDiaComponent handleTime={this.handleTime} dia='domingo' fields={this.state.fields}/>
                </Col>
              </Container>
            </Col>
            <Col>
            <FormGroup>
              <Button variant="outline-primary" onClick={this.toggle}>Guardar</Button>{'    '}
              </FormGroup>
            </Col>
            <Col>
             {messageError }
            </Col>
          </Form >
        </Container>
      </div>
    );
  }
}

export default EditarHorarioEmpleado;
