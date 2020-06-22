import React, { Component } from "react";
import {
  Container,
  Col,
  Form,
  Button,
  Alert,
  Modal,  
  Row
} from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import AppNavbar from "menu/AppNavbar";
import "css/App.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "css/react-datetime.css";
import Constant from "common/Constant";
import axios from "axios";

const options = Constant.OPTIONS_TABLE;
const PATH_HORARIO_UBICACION_SERVICE =
  Constant.HORARIO_API + '/ubicacion';

const PATH_UBICACIONES_SIN_HORARIO_SERVICE =
  PATH_HORARIO_UBICACION_SERVICE + "/ubicacionesSinHorario";

let rowId = "";

class HorarioUbicacion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      horarioUbicacion: [],
      ubicacion: {},
      modal: false
    };
  }

  componentDidMount() {    
    axios
      .get(PATH_HORARIO_UBICACION_SERVICE+'/all')
      .then(result => {
        if (result.data.length == 0) {
          this.setState({ isLoading: false });
        } else {
          rowId = result.data[0].id;
          this.setState({ horarioUbicacion: result.data, isLoading: false });
        }
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

  edit = id => {
    let path = `horarioUbicacion/${id}`;
    this.props.history.push(path);
  };

  create = () => {
    if(this.validateNuevoHorario()){
      let path = `horarioUbicacion/new`;
      this.props.history.push(path);
    }
  };

  remove = async id => {
    await axios({
      method: "DELETE",
      url: PATH_HORARIO_UBICACION_SERVICE + `/${id}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(() => {
        let ubicacion = this.state.horarioUbicacion.find(
          i => i.id == id
        );

        let updatedHorarioUbicacion = [...this.state.horarioUbicacion].filter(
          i => i.id != id
        );

        this.setState({
          horarioUbicacion: updatedHorarioUbicacion,
          formState: "success",
          modal: false,
          ubicacion: ubicacion
        });
      })
      .catch(error =>
        this.setState({
          error,
          isLoading: false,
          formState: "error"
        })
      );
  };

  validateNuevoHorario = () => {
    let isNingunaUbicacionSinHorario = false;
    axios
      .get(PATH_UBICACIONES_SIN_HORARIO_SERVICE)
      .then(result => {
        isNingunaUbicacionSinHorario = true;
      })
      .catch(error =>
        this.setState({
          error,
          isLoading: false,
          formState: "error"
        })
      );
      if(isNingunaUbicacionSinHorario){
        this.setState({formState:'fail_new'});
      }
      return !isNingunaUbicacionSinHorario;
  };

  onRowSelect(row, isSelected, e) {
    rowId = row["id"];
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  render() {
    const { horarioUbicacion, formState, error, ubicacion, isLoading } = this.state;

    if (isLoading) {
      return <p>Loading...</p>;
    }

    let messageLabel;
    if (formState == 'error') {
      messageLabel = <Alert variant="danger">{error.response.data.message}</Alert>;
    }else if(formState == 'success'){
      messageLabel = <Alert variant="success">El horario para la ubicacion {ubicacion.nombre} fue eliminado</Alert>;
    }else if(formState == 'fail_new'){
      messageLabel = <Alert variant="danger">No existen ubicaciones para definir horario</Alert>;
    }

    const columns = [
      {
        dataField: "id",
        text: "Id",
        isKey: "true",
        headerStyle: { width: "2%" }
      },
      {
        dataField: "nombre",
        text: "Ubicacion"
      },
      {
        dataField: "horarioSemana.lunes.fechas",
        text: "Lunes"
      },
      {
        dataField: "horarioSemana.martes.fechas",
        text: "Martes"
      },
      {
        dataField: "horarioSemana.miercoles.fechas",
        text: "Miercoles"
      },
      {
        dataField: "horarioSemana.jueves.fechas",
        text: "Jueves"
      },
      {
        dataField: "horarioSemana.viernes.fechas",
        text: "Viernes"
      },
      {
        dataField: "horarioSemana.sabado.fechas",
        text: "Sabado"
      },
      {
        dataField: "horarioSemana.domingo.fechas",
        text: "Domingo"
      }
    ];

    const selectRow = {
      mode: "radio",
      selected: [!horarioUbicacion.horarioSemana ? rowId : 0],
      clickToSelect: true,
      bgColor: "rgb(89, 195, 245)",
      onSelect: this.onRowSelect
    };

    const modal = (
      <Modal show={this.state.modal} onClick={this.toggle} className={this.props.className}>
        <Modal.Header onClick={this.toggle}>Confirmar Eliminar</Modal.Header>
        <Modal.Body>Esta seguro de eliminar el horario para la ubicacion{" "}{horarioUbicacion.nombre}</Modal.Body>
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
          <h2>Horario Ubicacion</h2>
          <Form className="form">
            <Col>
              <Container className="App">
                <Row>
                  <Col>
                    <Form.Group>
                      <BootstrapTable
                        keyField="id"
                        data={horarioUbicacion}
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
                <Button variant="outline-primary" onClick={() => this.edit(rowId)}>Modificar</Button>{"    "}
                <Button variant="outline-primary" onClick={() => this.create()}>Crear</Button>{"    "}
                <Button variant="outline-primary" onClick={this.toggle}>Eliminar</Button>
              </Form.Group>
            </Col>
            <Col>
             {messageLabel }
            </Col>
          </Form>
        </Container>
      </div>
    );
  }
}

export default HorarioUbicacion;
