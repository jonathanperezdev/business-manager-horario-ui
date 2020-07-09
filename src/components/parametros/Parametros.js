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
import Loading from 'common/Loading';
const options = Constant.OPTIONS_TABLE;

const PATH_PARAMETRO_SERVICE = Constant.HORARIO_API + "/parametro";

let rowId = "";

class Parametros extends Component {
  emptyState = {
    id: "",
    nombre: "",
    valor: "",
  };

  constructor(props) {
    super(props);

    this.state = {
      parametros: [],
      isLoading: true,
      error: null,
      errors: {},
      isExistData: true,
      modal: false,
      modalDelete: false,
      fields: this.emptyState,
      formState: "",
    };
  }

  componentDidMount() {
    axios
      .get(PATH_PARAMETRO_SERVICE + "/all")
      .then((result) => {
        if (result.data.length == 0) {
          this.setState({isExistData: false, isLoading: false });
        } else {
          rowId = result.data[0].id;
          this.setState({parametros: result.data, isExistData: true, isLoading: false});
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

  onRowSelect(row, isSelected, e) {
    rowId = row["id"];
  }

  edit = (id) => {
    let { fields, parametros } = this.state;
    let parametro = parametros.find((x) => x.id == id);

    fields.id = parametro.id;
    fields.nombre = parametro.nombre;
    fields.valor = parametro.valor;
    this.setState({ fields: fields });
  };

  newParametro = () => {
    let fields = this.state.fields;

    fields.id = "";
    fields.nombre = "";
    fields.valor = "";

    this.setState({ fields: fields });
  };

  remove = async (id) => {
    await axios({
      method: "DELETE",
      url: PATH_PARAMETRO_SERVICE + `/${id}`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
      .then(() => {
        let updatedParametros = [...this.state.parametros].filter((i) => i.id != id);
        
        let isExistData = true;        
        rowId = updatedParametros[0].id;

        if (updatedParametros.length == 0) {
          isExistData = false;
        }

        this.setState({parametros: updatedParametros, formState: "deleted", modalDelete: false, isExistData: isExistData, isLoading: false});
      })
      .catch((error) =>
        this.setState({error, formState: "error", modalDelete: false, isLoading: false})
      );
  };

  handleValidation = () => {    
    let fields = this.state.fields;
    let errors = {
      nombre: validateRequired(fields.nombre, "nombre"),
      valor: validateRequired(fields.valor, "valor"),
    };
    let formState = "";

    if (errors.nombre || errors.valor) {
      formState = "invalid";
    }

    this.setState({ errors: errors, formState: formState, isLoading: false });    
    return formState == !"invalid";
  };

  save = async () => {
    let { fields } = this.state;
    
    await axios({
      method: fields.id ? "PUT" : "POST",
      url: fields.id
        ? PATH_PARAMETRO_SERVICE + "/" + fields.id
        : PATH_PARAMETRO_SERVICE,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify(fields),
    })
      .then((result) => {
        let { parametros } = this.state;        
        if (fields.id) {
          parametros = this.updateParam(parametros,fields.id,result.data.valor);
        } else {
          parametros.push(result.data);
        }

        this.newParametro();
        this.setState({formState: "saved", modal: false, parametros: parametros, isLoading: false});
      })
      .catch((error) => this.setState({ error, formState: "error", isLoading: false, modal: false, modalDelete: false})
      );
  };

  updateParam = (parametros, id, valor) => {
    return parametros.map(param => {
      if(param.id == id){              
        return{
          ...param,
          valor: valor 
        }
      }
      return param;
    })
  }

  handleChange(value, field) {
    let { fields } = this.state;
    fields[field] = value;
    this.setState(fields);
  }  

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  toggleDelete = () => {
    this.setState({modalDelete: !this.state.modalDelete});
  };

  validateRequired = () => {    
    if (this.handleValidation()) {
      this.setState({ modal: true });
    }
  };

  render() {
    const {
      fields,
      parametros,
      isLoading,
      error,
      isExistData,
      errors,
      formState,
    } = this.state;

    if (isLoading) {
      return  <Loading/> 
    }

    let messageLabel;
    if (formState == "error") {
      messageLabel = (<Alert variant="danger">{error.response.data.message}</Alert>);
    } else if (formState == "invalid") {
      messageLabel = <Alert variant="danger">El fomulario tiene errores</Alert>;
    } else if (formState == "saved") {
      messageLabel = (<Alert variant="success">El parametro se guardo satisfactoriamente</Alert>);
    } else if (formState == "deleted") {
      messageLabel = (<Alert variant="success">El parametro se elimino satisfactoriamente</Alert>);
    }

    let messageNombre;
    if (errors.nombre) {
      messageNombre = <Alert variant="danger">{this.state.errors.nombre}</Alert>;
    }

    let messageValor;
    if (errors.valor) {
      messageValor = <Alert variant="danger">{this.state.errors.valor}</Alert>;
    }

    const columns = [
      {
        dataField: "nombre",
        text: "Nombre",
        isKey: "true",
      },
      {
        dataField: "valor",
        text: "Valor",
      },
    ];

    const selectRow = {
      mode: "radio",
      selected: [isExistData ? rowId : 0],
      clickToSelect: true,
      bgColor: "rgb(89, 195, 245)",
      onSelect: this.onRowSelect,
    };

    const actionTittle = fields.id ? "Actualizar" : "Crear";
    const modal = (
      <Modal show={this.state.modal} onClick={this.toggle} className={this.props.className}>
        <Modal.Header onClick={this.toggle}>Confirmar {actionTittle}</Modal.Header>
    <Modal.Body>Esta seguro de {actionTittle} el parametro</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => this.save()}>Aceptar</Button>{" "}
          <Button variant="outline-secondary" onClick={this.toggle}>Cancelar</Button>
        </Modal.Footer>
      </Modal>
    );

    const modalDelete = (
      <Modal show={this.state.modalDelete} onClick={this.toggleDelete} className={this.props.className}>
        <Modal.Header onClick={this.toggleDelete}>Confirmar Eliminar</Modal.Header>
        <Modal.Body>Esta seguro de eliminar el parametro</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={(rowid) => this.remove(rowId)}>Eliminar</Button>{" "}
          <Button variant="outline-secondary" onClick={this.toggleDelete}>Cancelar</Button>
        </Modal.Footer>
      </Modal>
    );

    return (
      <div>
        {modal}
        {modalDelete}
        <AppNavbar />
        <Container className="App">
          <h2>Parametros</h2>
          <Form className="form">
            <Col>
              <Container className="App">
                <h5>Parametro</h5>
                <Row>
                  <Col>
                    <Form.Group controlId="parametro.nombre">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control                        
                        size="25"
                        placeholder="Nombre"
                        onChange={(e) => {
                          this.handleChange(e.target.value, "nombre");
                        }}
                        value={fields.nombre}
                        disabled={fields.id}
                      />
                      {messageNombre}
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="parametro.valor">
                      <Form.Label>Valor</Form.Label>
                      <Form.Control                        
                        size="30"
                        placeholder="Valor"
                        onChange={(e) => {
                          this.handleChange(e.target.value, "valor");
                        }}
                        value={fields.valor}
                      />
                      {messageValor}
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
            </Col>
            <Col>
              <Container className="App">
                <h5>Parametros</h5>
                <Row>
                  <Col>
                    <Form.Group>
                      <BootstrapTable
                        keyField="id"
                        data={parametros}
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
                <Button variant="outline-primary" onClick={this.validateRequired}>Guardar</Button>{"    "}
                <Button variant="outline-secondary" onClick={() => this.newParametro()}>Nuevo</Button>{"    "}
                <Button variant="outline-primary" disabled={!this.state.isExistData} onClick={() => this.edit(rowId)}>Modificar</Button>{"    "}
                <Button variant="outline-primary" disabled={!this.state.isExistData} onClick={this.toggleDelete}>Eliminar</Button>
              </Form.Group>
            </Col>
            <Col>{messageLabel}</Col>
          </Form>
        </Container>
      </div>
    );
  }
}

export default Parametros;
