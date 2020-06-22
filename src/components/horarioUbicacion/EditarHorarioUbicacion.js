import React, { Component } from "react";
import {
  Container,
  Col,
  Form,
  Button,
  Alert,  
  Row
} from "react-bootstrap";
import { Link } from 'react-router-dom';
import AppNavbar from "menu/AppNavbar";
import "css/App.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import Constant from "common/Constant";
import axios from "axios";
import Datetime from "react-datetime";
import "css/react-datetime.css";

const PATH_HORARIO_UBICACION_SERVICE =
  Constant.HORARIO_API + '/ubicacion';

const PATH_UBICACIONES_SERVICE = 
Constant.HORARIO_API + '/ubicacion/all';

const PATH_UBICACIONES_SIN_HORARIO_SERVICE =
Constant.HORARIO_API + '/ubicacion/ubicacionesSinHorario';

const TIME_FORMAT = Constant.TIME_FORMAT;

class EditarHorarioUbicacion extends Component {
  emptyState = {
    id: "",
    nombre: ""
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      fields: this.emptyState,
      ubicaciones: []
    };
  }

  componentDidMount() {    
    let id = this.props.match.params.id;
    if (id !='new') {
      this.loadUbicacion(PATH_UBICACIONES_SERVICE);
      this.loadHorarioUbicacion(PATH_HORARIO_UBICACION_SERVICE + '/'+id);
    } else {
      this.loadUbicacion(PATH_UBICACIONES_SIN_HORARIO_SERVICE);
    }
  }

  loadUbicacion = (pathService) => {
    axios.get(pathService)
      .then(result => {
        let {fields} = this.state;
        fields.id = this.props.match.params.id;
        this.setState({
          ubicaciones: result.data,
          isLoading: false,
          formState: "ok",
          fields: fields
        });
      })
      .catch(error =>
        this.setState({
          error,
          isLoading: false,
          formState: "error"
        })
      );
  }

  loadHorarioUbicacion = (pathService) => {
    axios.get(pathService)
      .then(result => {
        let fields = this.state;
        fields.horarioSemana = result.data.horarioSemana;

        this.setState({ fields: result.data });
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
      method: "PUT",
      url: PATH_HORARIO_UBICACION_SERVICE,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      data: JSON.stringify(fields)
    }).then(result => {
      this.setState({ isLoading: false, formState: 'success' });
    }).catch(error =>
      this.setState({
        error,
        formState: "error",
        isLoading: false
      })
    );
  };

  nuevo = () => {
    let {fields} = this.state;

    fields.id='new';
    fields.nombre='';
    fields.horarioSemana=null;

    this.loadUbicacion(PATH_UBICACIONES_SIN_HORARIO_SERVICE);

    this.setState({fields: fields, formState: ''});
  }

  handleTime = (date, dia, field) => {
    let {fields } = this.state;
    let diaSemana = fields.horarioSemana[dia];

    diaSemana[field] = date.format(TIME_FORMAT);

    this.setState({ fields });
  };

  handleUbicacionChange = e => {
    let { fields } = this.state;

    if(!e.target.value){
      this.nuevo();
    }else{
      fields.id = e.target.value;
      this.loadHorarioUbicacion(PATH_HORARIO_UBICACION_SERVICE + '/horarioDefault/'+e.target.value);
    }
    this.setState({ fields });
  };

  render() {
    const { fields, ubicaciones, formState, error, isLoading } = this.state;

    if (isLoading) {
      return <p>Loading...</p>;
    }

    let messageLabel;
    if (formState == 'error') {
      messageLabel = <Alert variant="danger">{error.response.data.message}</Alert>;
    }else if(formState == 'success'){
      messageLabel = <Alert variant="success">Se creo correctamente el horario para la ubicacion {fields.nombre}</Alert>;
    }

    let optionUbicaciones;
    if (ubicaciones.length > 0) {
      optionUbicaciones = ubicaciones.map(ubicacion => (
        <option
          key={ubicacion.id}
          value={ubicacion.id}>
          {ubicacion.nombre}
        </option>
      ));
    }

    return (
      <div>
        <AppNavbar />
        <Container className="App">
          <h5>Editar Horario por Ubicacion</h5>
          <Form className="form">
            <Col>
              <Form.Group>
                <Form.Label>Ubicacion</Form.Label>
                <Form.Control                  
                  as="select"
                  onChange={this.handleUbicacionChange}
                  disabled={fields.id != 'new'}
                  value={this.state.fields.id}>
                  <option value=''>Seleccionar</option>
                  {optionUbicaciones}
                </Form.Control>
              </Form.Group>
            </Col>
            <Container className="App">
              <h5>Horario Semana</h5>
              <Col>
                <Row>
                  <Col sm="2">
                    <h5>&nbsp;</h5>
                    <h5>Lunes</h5>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                          ? fields.horarioSemana.lunes.fechaInicio
                          : ''
                        }
                        onChange={e => {
                          this.handleTime(e, "lunes", "fechaInicio");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.lunes.fechaFin
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "lunes", "fechaFin");
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col sm="2">
                    <h5>&nbsp;</h5>
                    <h5>Martes</h5>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.martes.fechaInicio
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "martes", "fechaInicio");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.martes.fechaFin
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "martes", "fechaFin");
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col sm="2">
                    <h5>&nbsp;</h5>
                    <h5>Miercoles</h5>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.miercoles.fechaInicio
                            : ''
                        }
                        onChange={e => {
                          this.handleTime(e, "miercoles", "fechaInicio");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.miercoles.fechaFin
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "miercoles", "fechaFin");
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col sm="2">
                    <h5>&nbsp;</h5>
                    <h5>Jueves</h5>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.jueves.fechaInicio
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "jueves", "fechaInicio");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.jueves.fechaFin
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "jueves", "fechaFin");
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col sm="2">
                    <h5>&nbsp;</h5>
                    <h5>Viernes</h5>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.viernes.fechaInicio
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "viernes", "fechaInicio");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.viernes.fechaFin
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "viernes", "fechaFin");
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col sm="2">
                    <h5>&nbsp;</h5>
                    <h5>Sabado</h5>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.sabado.fechaInicio
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "sabado", "fechaInicio");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.sabado.fechaFin
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "sabado", "fechaFin");
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col sm="2">
                    <h5>&nbsp;</h5>
                    <h5>Domingo</h5>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.domingo.fechaInicio
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "domingo", "fechaInicio");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Datetime
                        dateFormat={false}
                        timeFormat={TIME_FORMAT}
                        inputProps={{readOnly:true}}
                        value={
                          fields.horarioSemana
                            ? fields.horarioSemana.domingo.fechaFin
                            : ""
                        }
                        onChange={e => {
                          this.handleTime(e, "domingo", "fechaFin");
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Container>
            <Form.Group>
              <Button variant="outline-primary" onClick={this.save}>Guardar</Button>{"  "}
              <Button onClick={this.nuevo} variant="outline-secondary">Nuevo</Button>{"  "}
              <Button tag={Link} to='/HorarioUbicacion' variant="outline-secondary">Regresar</Button>
            </Form.Group>
            <Col>
             {messageLabel }
            </Col>
          </Form>
        </Container>
      </div>
    );
  }
}

export default EditarHorarioUbicacion;
