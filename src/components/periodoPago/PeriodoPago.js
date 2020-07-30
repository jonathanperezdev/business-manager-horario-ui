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
import Constant from "common/Constant";
import axios from "axios";
import { validateRequired } from "common/Validator";
import Datetime from "react-datetime";
import "css/react-datetime.css";
import Moment from "moment";
import Loading from "common/Loading";
import { withRouter } from "react-router-dom";

const options = Constant.OPTIONS_TABLE;
const PATH_PERIODO_PAGO_SERVICE =
  Constant.HORARIO_API + Constant.PERIODO_PAGO_SERVICE;
const PATH_PERIODO_PAGO_YEARS_SERVICE = PATH_PERIODO_PAGO_SERVICE + "/years/";
const DATE_FORMAT = Constant.DATE_FORMAT;

function dateFormatter(cell: any) {
  if (!cell) {
    return "";
  }
  return `${
    Moment(cell).format(DATE_FORMAT)
      ? Moment(cell).format(DATE_FORMAT)
      : Moment(cell).format(DATE_FORMAT)
  }`;
}

class PeriodoPago extends Component {
  emptyState = {
    id: "",
    fechaInicio: "",
    fechaFin: "",
    diasLiquidados: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      periodosPago: [],
      isLoading: false,
      error: null,
      errors: {},
      modal: false,
      fields: this.emptyState,
      formState: "",
      anos: [],
      ano: Moment().format("YYYY"),
      rowId: 0,
    };
  }

  componentDidMount() {
    this.loadAnosCombo();
  }

  loadPeriodosPago = (ano) => {
    if (ano == "select") {
      this.setState({ periodosPago: [] });
    } else {
      axios
        .get(PATH_PERIODO_PAGO_YEARS_SERVICE + ano)
        .then((result) => {
          if (result.data.length == 0) {
            this.setState({ isLoading: false });
          } else {
            this.setState({
              periodosPago: result.data,
              isLoading: false,
              rowId: result.data[0].id,              
            });
          }
        })
        .catch((error) =>
          this.setState({
            error,
            formState: "error",
            isLoading: false,
            modal: false,
          })
        );
    }
  };

  loadAnosCombo = () => {
    axios
      .get(PATH_PERIODO_PAGO_YEARS_SERVICE)
      .then((result) => {
        let anos = result.data;
        this.setState({
          anos: anos          
        });
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

  onRowSelect = (row, isSelected, e) => {
    this.setState({ rowId: row["id"] });
  };

  remove = async (id) => {    
    await axios({
      method: "DELETE",
      url: PATH_PERIODO_PAGO_SERVICE + `/${id}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then(() => {
        let {fields} = this.state;

        fields.ano = 'select';
        this.loadPeriodosPago(fields.ano);
        this.loadAnosCombo();

        this.setState({          
          formState: "deleted",
          modal: false,
          rowId: 0,
          fields: fields          
        });
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
          formState: "error",
          modal: false,
        })
      );
  };

  create = async () => {
    const fields = this.state.fields;
    await axios({
      method: "POST",
      url: PATH_PERIODO_PAGO_SERVICE,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify(fields),
    })
      .then((result) => {
        fields.ano = Moment(fields.fechaInicio).format("YYYY");
        this.loadPeriodosPago(fields.ano);
        this.loadAnosCombo();
        this.setState(fields);
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

  newPeriodoPago = () => {
    let { fields } = this.state;

    fields.id = "";
    fields.fechaInicio = "";
    fields.fechaFin = "";

    this.setState({ fields: fields });
  };

  detalle = (idPeriodoPago) => {
    let path = `horarioEmpleado/${idPeriodoPago}`;
    this.props.history.push(path);
  };

  addYear = (fecha, anosArray) => {
    let ano = Moment(fecha, Constant.DATE_FORMAT).toDate().getFullYear();
    if (anosArray.indexOf(ano) == -1) {
      anosArray.push(ano);
      anosArray.sort();
    }

    return anosArray;
  };

  handleValidation() {
    let { fields } = this.state;

    let errors = {
      fechaInicio: validateRequired(fields.fechaInicio, "fecha inicio"),
      fechaFin: validateRequired(fields.fechaFin, "fecha fin"),
    };
    let formState = "";

    if (errors.fechaInicio || errors.fechaFin) {
      formState = "invalid";
    }
    this.setState({ errors: errors, formState: formState });
    return formState == !"invalid";
  }

  handleDate = (date, field) => {
    let { fields } = this.state;
    fields[field] = date.format(DATE_FORMAT);

    if (fields.fechaInicio && fields.fechaFin) {
      fields.diasLiquidados =
        Moment(fields.fechaFin, Constant.DATE_FORMAT).diff(
          Moment(fields.fechaInicio, Constant.DATE_FORMAT),
          "days"
        ) + 1;
    }
    this.setState({ fields });
  };

  handleChange = (value, field) => {
    let { fields } = this.state;

    fields[field] = value;

    this.loadPeriodosPago(value);
    this.setState({ fields });
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal,
    });
  };

  validateRequired = () => {
    if (this.handleValidation()) {
      this.create();
    }
  };

  render() {
    const {
      periodosPago,
      isLoading,
      error,
      errors,
      formState,
      anos,
      rowId,
      fields,
    } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    let messageLabel;
    if (formState == "error") {
      messageLabel = (
        <Alert variant="danger">{error.response.data.message}</Alert>
      );
    } else if (formState == "success") {
      messageLabel = (
        <Alert variant="success">
          El periodo de pago se creo satisfactoriamente {fields.nombre}
        </Alert>
      );
    } else if (formState == "deleted") {
      messageLabel = (
        <Alert variant="success">
          El periodo de pago se elimino satisfactoriamente
        </Alert>
      );
    }

    let messageFechaInicio;
    if (errors.fechaInicio) {
      messageFechaInicio = (
        <Alert variant="danger">{this.state.errors.fechaInicio}</Alert>
      );
    }

    let messageFechaFin;
    if (errors.fechaFin) {
      messageFechaFin = (
        <Alert variant="danger">{this.state.errors.fechaFin}</Alert>
      );
    }

    const columns = [
      {
        dataField: "id",
        text: "Id",
        isKey: "true",
      },
      {
        dataField: "fechaInicio",
        text: "Fecha Inicio",
        formatter: dateFormatter,
      },
      {
        dataField: "fechaFin",
        text: "Fecha Fin",
        formatter: dateFormatter,
      },
      {
        dataField: "diasLiquidados",
        text: "Dias Liquidados",
      },
    ];

    const selectRow = {
      mode: "radio",
      selected: [periodosPago.length != 0 ? rowId : 0],
      clickToSelect: true,
      bgColor: "rgb(89, 195, 245)",
      onSelect: this.onRowSelect,
    };

    let optionAnos = anos.map((ano) => (
      <option key={ano} value={ano}>
        {ano}
      </option>
    ));

    const modal = (
      <Modal
        show={this.state.modal}
        onClick={this.toggle}
        className={this.props.className}
      >
        <Modal.Header onClick={this.toggle}>Confirmar Eliminar</Modal.Header>
        <Modal.Body>Esta seguro de eliminar el periodo de pago</Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={(rowid) => this.remove(rowId)}
          >
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
          <h2>Periodo Pago</h2>
          <Form className="form">
            <Col>
              <Container className="App">
                <h5>Periodo</h5>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Fecha Inicio</Form.Label>
                      <Datetime
                        dateFormat={DATE_FORMAT}
                        timeFormat={false}
                        onChange={(e) => {
                          this.handleDate(e, "fechaInicio");
                        }}
                        value={this.state.fields.fechaInicio}
                      />
                      {messageFechaInicio}
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Fecha Fin</Form.Label>
                      <Datetime
                        dateFormat={DATE_FORMAT}
                        timeFormat={false}
                        onChange={(e) => {
                          this.handleDate(e, "fechaFin");
                        }}
                        value={this.state.fields.fechaFin}
                      />
                      {messageFechaFin}
                    </Form.Group>
                  </Col>
                  <Col sm="2">
                    <Form.Group>
                      <Form.Label>Dias a Liquidar</Form.Label>
                      <Form.Control
                        disabled
                        value={this.state.fields.diasLiquidados}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
            </Col>
            <Col>
              <Container className="App">
                <Row>
                  <Col>
                    <h5>Periodos de Pago</h5>
                  </Col>
                  <Col sm="2">
                    <Form.Control
                      as="select"
                      onChange={(e) => {
                        this.handleChange(e.target.value, "ano");
                      }}
                      value={this.state.fields.ano}
                    >
                      <option value="select">Seleccionar</option>
                      {optionAnos}
                    </Form.Control>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group>
                      <BootstrapTable
                        keyField="id"
                        data={periodosPago}
                        columns={columns}
                        selectRow={selectRow}
                        pagination={paginationFactory(options)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
            </Col>
            <Col>
              <Form.Group>
                <Button variant="outline-primary" onClick={this.validateRequired}>Crear</Button>{"    "}
                <Button variant="outline-secondary" onClick={() => this.newPeriodoPago()}>Nuevo</Button>{"    "}
                <Button variant="outline-primary" disabled={rowId == 0} onClick={(rowId) => this.detalle(this.state.rowId)}>Detalle</Button>{"    "}
                <Button variant="outline-primary" disabled={rowId == 0} onClick={this.toggle}>Eliminar</Button>
              </Form.Group>
            </Col>
            <Col>{messageLabel}</Col>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withRouter(PeriodoPago);
