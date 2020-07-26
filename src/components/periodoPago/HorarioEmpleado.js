import React, { Component } from "react";
import {
  Container,
  Col,
  Form,
  Button,
  Alert,
  Modal,
  Row,
} from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import AppNavbar from "menu/AppNavbar";
import "css/App.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "css/react-datetime.css";
import Constant from "common/Constant";
import axios from "axios";
import { validateRequired } from "common/Validator";
import { Link, withRouter } from "react-router-dom";
import Loading from "common/Loading";

function horasFormatter(cell: any) {
  if (!cell) {
    return "0 horas";
  }
  return cell + " horas";
}

const options = Constant.OPTIONS_TABLE;

const PATH_UBICACIONES_SERVICE = Constant.HORARIO_API + "/ubicacion/all";
const PATH_PERIODO_PAGO_SERVICE =
  Constant.HORARIO_API + Constant.PERIODO_PAGO_SERVICE;

class HorarioEmpleado extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      horarioEmpleado: [],
      consultParams: { ubicacion: "all" },
      ubicaciones: [],
      periodoPago: { fechaInicio: "", fechaFin: "" },
      modal: false,
      errors: {},
      rowId: 0,
    };
  }

  componentDidMount() {
    axios
      .get(PATH_UBICACIONES_SERVICE)
      .then((result) => {
        this.setState({
          ubicaciones: result.data,
          isLoading: false,
        });
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
          formState: "error",
        })
      );

    axios
      .get(PATH_PERIODO_PAGO_SERVICE + this.props.match.params.id)
      .then((result) => {
        this.setState({
          periodoPago: result.data,
          isLoading: false,
        });
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
          formState: "error",
        })
      );
  }

  edit = (idEmpleado, idUbicacion, idSemana) => {
    let path = `/editarHorarioEmpleado/${idEmpleado}/${idUbicacion}/${idSemana}`;
    this.props.history.push(path);
  };

  consultar = async () => {
    let { consultParams } = this.state;

    let horarioEmpleadoPath =
      PATH_PERIODO_PAGO_SERVICE + "semana/" + consultParams.semana;
    if (consultParams.ubicacion != "all") {
      horarioEmpleadoPath =
        horarioEmpleadoPath + "/ubicacion/" + consultParams.ubicacion;
    }

    axios
      .get(horarioEmpleadoPath + "/horarioEmpleado")
      .then((result) => {
        this.setState({
          horarioEmpleado: result.data,
          rowId: result.data[0].empleado.id,
          isLoading: false,
          formState: "ok",
        });
      })
      .catch((error) =>
        this.setState({
          error,
          horarioEmpleado: [],
          isLoading: false,
          formState: "error",
        })
      );
  };

  onRowSelect = (row, isSelected, e) => {
    this.setState({ rowId: row.empleado.id });
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal,
    });
  };

  handleChange = (valor, field) => {
    let { consultParams } = this.state;
    consultParams[field] = valor;    

    this.setState(consultParams);
    if (this.handleValidation()) {
      this.consultar();
    }
  };

  handleValidation() {
    let { consultParams } = this.state;

    let errors = {
      semana: validateRequired(consultParams.semana, "semana"),
    };
    let formState = "";

    if (errors.semana) {
      formState = "invalid";
    }
    this.setState({ errors: errors, formState: formState });
    return formState == !"invalid";
  }

  render() {
    const {
      horarioEmpleado,
      ubicaciones,
      periodoPago,
      formState,
      error,
      errors,
      rowId,
      consultParams,
      isLoading,
    } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    let messageLabel;
    if (formState == "error") {
      messageLabel = (
        <Alert variant="danger">{error.response.data.message}</Alert>
      );
    }

    let messageSemana;
    if (errors.semana) {
      messageSemana = (
        <Alert variant="danger">{this.state.errors.semana}</Alert>
      );
    }

    let optionUbicaciones;
    if (ubicaciones.length > 0) {
      optionUbicaciones = ubicaciones.map((ubicacion) => (
        <option key={ubicacion.id} value={ubicacion.id}>
          {ubicacion.nombre}
        </option>
      ));
    }

    let semanas = periodoPago.semanas;
    let optionSemanas;
    if (semanas.length > 0) {
      optionSemanas = semanas.map((semana) => (
        <option key={semana.id} value={semana.id}>
          Semana:{semana.numeroSemana} [{semana.fechaInicio}] - [
          {semana.fechaFin}]
        </option>
      ));
    }

    const columns = [
      {
        dataField: "empleado.id",
        text: "Id",
        isKey: "true",
        headerStyle: { width: "3%" },
      },
      {
        dataField: "empleado.apellidos",
        text: "Apellidos",
      },
      {
        dataField: "empleado.nombres",
        text: "Nombres",
      },
      {
        dataField: "lunes.horas",
        text: "Lunes",
        formatter: horasFormatter,
      },
      {
        dataField: "martes.horas",
        text: "Martes",
        formatter: horasFormatter,
      },
      {
        dataField: "miercoles.horas",
        text: "Miercoles",
        formatter: horasFormatter,
      },
      {
        dataField: "jueves.horas",
        text: "Jueves",
        formatter: horasFormatter,
      },
      {
        dataField: "viernes.horas",
        text: "Viernes",
        formatter: horasFormatter,
      },
      {
        dataField: "sabado.horas",
        text: "Sabado",
        formatter: horasFormatter,
      },
      {
        dataField: "domingo.horas",
        text: "Domingo",
        formatter: horasFormatter,
      },
    ];

    const selectRow = {
      mode: "radio",
      selected: [!horarioEmpleado.horarioSemana ? rowId : 0],
      clickToSelect: true,
      bgColor: "rgb(89, 195, 245)",
      onSelect: this.onRowSelect,
    };

    let tableHorario = (
      <Col>
        <Container className="App">
          <Row>
            <Col>
              <h5>Horario</h5>
            </Col>
            <Col sm="2">
              <Form-Group>
                <Form.Control
                  as="select"
                  value={this.state.consultParams.ubicacion}
                  onChange={(e) => {
                    this.handleChange(e.target.value, "ubicacion");
                  }}
                >
                  <option value="all">Ubicaciones</option>
                  {optionUbicaciones}
                </Form.Control>
              </Form-Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <BootstrapTable
                  keyField="empleado.id"
                  data={horarioEmpleado}
                  columns={columns}
                  selectRow={selectRow}
                  pagination={paginationFactory(options)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Col>
    );

    const modal = (
      <Modal
        show={this.state.modal}
        onClick={this.toggle}
        className={this.props.className}
      >
        <Modal.Header onClick={this.toggle}>Confirmar Eliminar</Modal.Header>
        <Modal.Body>
          Esta seguro de eliminar el horario para la ubicacion{" "}
          {horarioEmpleado.nombre}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => this.remove(rowId)}>
            Eliminar
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
          <h2>Horario Empleado</h2>
          <Form className="form">
            <Col>
              <Container className="App">
                <Row>
                  <Col xs="auto">
                    <h5>&nbsp;</h5>
                    <h5>Periodo Pago</h5>
                  </Col>
                  <Col xs="2">
                    <Form.Group>
                      <Form.Label>Fecha Inicio</Form.Label>
                      <Form.Control
                        disabled
                        value={this.state.periodoPago.fechaInicio}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs="2">
                    <Form-Group>
                      <Form.Label>Fecha Fin</Form.Label>
                      <Form.Control
                        disabled
                        value={this.state.periodoPago.fechaFin}
                      />
                    </Form-Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Semana</Form.Label>
                      <Form.Control
                        as="select"
                        value={this.state.consultParams.semana}
                        onChange={(e) => {
                          this.handleChange(e.target.value, "semana");
                        }}
                      >
                        <option value="">Seleccionar</option>
                        {optionSemanas}
                      </Form.Control>
                      {messageSemana}
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
            </Col>
            {tableHorario}
            <Col>
              <Form.Group>
                <Button
                  variant="outline-primary"
                  onClick={(idEmpleado, idUbicacion, idSemana) =>
                    this.edit(
                      rowId,
                      consultParams.ubicacion,
                      consultParams.semana
                    )
                  }
                >
                  Modificar
                </Button>
                {"    "}
                <Button variant="outline-primary" onClick={this.toggle}>
                  Eliminar
                </Button>
              </Form.Group>
            </Col>
            <Col>{messageLabel}</Col>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withRouter(HorarioEmpleado);
