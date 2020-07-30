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
import Loading from 'common/Loading';

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
      ubicaciones: [],
      ubicacion: {},
      modal: false,
      modalDefinirHorario: false,
      messageDefinirHorario: ''
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
          this.setState({ ubicaciones: result.data, isLoading: false });
        }
      })
      .catch(error =>
        this.setState({
          error,
          formState: "error",
          isLoading: false,
          modal: false,
          modalDefinirHorario: false
        })
      );
  }

  definirHorario = id => {

    let path = `horarioUbicacion/${id}`;
    this.props.history.push(path);
  };

  toggleDefinirHorario = () => {
    let ubicacion = this.state.ubicaciones.find(
      i => i.id == rowId
    );

    let messageDefinirHorario;    
    if(!ubicacion.horarioSemana.lunes) {
      messageDefinirHorario = 'Esta seguro de definir el horario por default para la ubicacion '+ubicacion.nombre+'?';
    } else {
      messageDefinirHorario = 'Esta seguro de modificar el horario para la ubicacion '+ubicacion.nombre+'?'      
    }

    this.setState({
      modalDefinirHorario: !this.state.modalDefinirHorario,
      messageDefinirHorario: messageDefinirHorario,
      ubicacion: ubicacion
    });
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
        let ubicacion = this.state.ubicaciones.find(
          i => i.id == id
        );

        let updatedUbicaciones = [...this.state.ubicaciones].filter(
          i => i.id != id
        );

        this.setState({
          ubicaciones: updatedUbicaciones,
          formState: "success",
          modal: false,
          modalDefinirHorario: false,
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

  onRowSelect(row, isSelected, e) {
    rowId = row["id"];
  }

  toggle = () => {
    let ubicacion = this.state.ubicaciones.find(
      i => i.id == rowId
    );

    this.setState({
      modal: !this.state.modal,
      ubicacion: ubicacion
    });
  }; 

  render() {
    const { ubicaciones, formState, error, ubicacion, isLoading, messageDefinirHorario } = this.state;

    if (isLoading) {
      return  <Loading/>
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
        headerStyle: { width: "3%" }
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
      selected: [!ubicacion.horarioSemana ? rowId : 0],
      clickToSelect: true,
      bgColor: "rgb(89, 195, 245)",
      onSelect: this.onRowSelect
    };

    const modal = (
      <Modal show={this.state.modal} onClick={this.toggle} className={this.props.className}>
        <Modal.Header onClick={this.toggle}>Confirmar Eliminar</Modal.Header>
        <Modal.Body>Esta seguro de eliminar el horario para la ubicacion{" "}{ubicacion.nombre}</Modal.Body>
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

    const modalDefinirHorario = (
      <Modal show={this.state.modalDefinirHorario} onClick={this.toggleDefinirHorario} className={this.props.className}>
        <Modal.Header onClick={this.toggleDefinirHorario}>Definir Horario ubicacion {ubicacion.nombre}</Modal.Header>
        <Modal.Body>{messageDefinirHorario}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => this.definirHorario(rowId)}>
            Definir Horario
          </Button>{" "}
          <Button variant="outline-secondary" onClick={this.toggleDefinirHorario}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    );
    return (
      <div>
        {modal}
        {modalDefinirHorario }
        <AppNavbar />
        <Container className="App">
          <h2>Horario Ubicacion</h2>
          <Form className="form">
            <Col>              
                <Row>
                  <Col>
                    <Form.Group>
                      <BootstrapTable
                        keyField="id"
                        data={ubicaciones}
                        columns={columns}
                        selectRow={selectRow}
                        pagination={paginationFactory(options)}
                      />
                    </Form.Group>
                  </Col>
                </Row>              
            </Col>
            <Col>
              <Form.Group>
                <Button variant="outline-primary" onClick={this.toggleDefinirHorario}>Definir Horario</Button>{"    "}                
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
