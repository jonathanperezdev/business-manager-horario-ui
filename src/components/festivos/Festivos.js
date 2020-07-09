import React, { Component } from 'react';
import { Container, Col, Form, Button, Alert, Modal,  Row} from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AppNavbar from 'menu/AppNavbar';
import 'css/App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Constant from 'common/Constant';
import axios from 'axios';
import {validateRequired} from 'common/Validator';
import Datetime from "react-datetime";
import 'css/react-datetime.css';
import Moment from 'moment';
import Loading from 'common/Loading';

const options = Constant.OPTIONS_TABLE;

const PATH_FESTIVOS_SERVICE = Constant.HORARIO_API+'/festivo/';
const DATE_FORMAT = Constant.DATE_FORMAT;

let rowId = '';

function dateFormatter(cell: any) {
  if (!cell) {
      return "";
  }
  return `${Moment(cell).format(DATE_FORMAT)? Moment(cell).format(DATE_FORMAT):Moment(cell).format(DATE_FORMAT) }`;
}

class Festivos extends Component {

  emptyState = {
    id:'',
    festivo: '', 
    ano: 0
  };

  constructor(props) {
    super(props);

    this.state = {
      festivos: [],
      isLoading: true,
      error: null,
      errors: {},
      isExistData: true,
      modal: false,
      fields: this.emptyState,
      formState: '',
      anos: [],
      ano: ''
    };
  }

  componentDidMount() {
    this.loadYears();
    this.loadFestivos(Moment().format('YYYY'));
  }

  loadYears = () => {
    axios.get(PATH_FESTIVOS_SERVICE+'years')
      .then(result => {
        let anos = result.data;                
        this.setState({
          anos: anos,
          ano: (anos.length == 0) ? Moment().format('YYYY') : anos[anos.length-1],
          isLoading: false
        });
      }).catch(error => this.setState({
        error,
        formState: 'error',
        isLoading: false,
        modal: false
      }));
  }

  loadFestivos = (ano) =>{    
    axios.get(PATH_FESTIVOS_SERVICE+ano)
    .then(result => {
      if(result.data.length == 0){
        this.setState({isLoading: false, isExistData: false});
      }else{
        rowId = result.data[0].id;

        this.setState({festivos: result.data, isLoading: false, isExistData: true});
      }
    }).catch(error => this.setState({
      error,
      formState: 'error',
      isLoading: false,
      modal: false
    }));
  }

  onRowSelect(row, isSelected, e) {
    rowId = row['id'];
  }

  remove = async (id) => {
    await axios({
      method: 'DELETE',
      url: PATH_FESTIVOS_SERVICE+`/${id}`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(() => {
      let updatedFestivos = [...this.state.festivos].filter(i => i.id != id);
      let isExistData = true;

      if(updatedFestivos.length == 0){
        isExistData = false;
      }

      this.setState({festivos: updatedFestivos, formState: 'deleted', modal:false, isExistData: isExistData});
    }).catch(error => this.setState({
        error, isLoading: false, formState: 'error', modal: false
    }));

    this.loadYears();
  }

  save = async () => {
    const fields = this.state.fields;

    await axios({
      method: 'POST',
      url: PATH_FESTIVOS_SERVICE,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(fields)
    }).then(result => {
      let {festivos, anos} = this.state;
      festivos.push(result.data);
      this.setState({formState: 'saved', modal: false, festivos: festivos, anos: this.addYear(result.data.festivo, anos)})
    }).catch(error => this.setState({
      error,
      formState: 'error',
      isLoading: false,
      modal: false
    }));
  }

  addYear = (fecha, anosArray) => {
    let ano = Moment(fecha, Constant.DATE_FORMAT).toDate().getFullYear();
    if(anosArray.indexOf(ano) == -1){
      anosArray.push(ano);
      anosArray.sort();
    }

    return anosArray;
  }

  handleValidation(){
    let {fields} = this.state;
    let errors = {festivo: validateRequired(fields.festivo, "festivo")};
    let formState = '';

    if(errors.festivo){
      formState = 'invalid';
    }
    this.setState({errors: errors, formState: formState});
    return formState ==! 'invalid';
  }

  handleDate = (date) => {
    let {fields} = this.state;
    fields.festivo = date.format(DATE_FORMAT);
    this.setState({fields});
  }  

  handleChange(value, field) {
    let { fields } = this.state;
    fields[field] = value;

    this.loadFestivos(value);
    this.setState(fields);
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  validateRequired = () => {
    if(this.handleValidation()){
      this.save();
    }
  }

  render() {
    const {fields, festivos, isLoading, error, isExistData, errors, formState, anos } = this.state;

    if (isLoading) {
      return  <Loading/> 
    }

    let messageLabel;
    if (formState == 'error') {
      messageLabel = <Alert variant="danger">{error.response.data.message}</Alert>;
    }else if(formState == 'saved'){
      messageLabel = <Alert variant="success">El festivo se guardo satisfactoriamente</Alert>;
    }else if(formState == 'deleted'){
      messageLabel = <Alert variant="success">El festivo se elimino satisfactoriamente</Alert>;
    }

    let messageFestivo;
    if(errors.festivo){
      messageFestivo = <Alert variant="danger">{this.state.errors.festivo}</Alert>;
    }

    const columns = [
    {
      dataField: 'festivo',
      text: 'Festivo',
      isKey: 'true',
      formatter: dateFormatter
    }];

    const selectRow = {
      mode: 'radio',
      selected: [isExistData?rowId:0],
      clickToSelect: true,
      bgColor: "rgb(89, 195, 245)",
      onSelect: this.onRowSelect
    };

    let optionAnos = anos.map((ano) =>
      <option defaultValue={ano} key={ano}
      value={ano} >{ano}</option>
    );

    const modal = <Modal show={this.state.modal} onClick={this.toggle} className={this.props.className}>
                    <Modal.Header onClick={this.toggle}>Confirmar Eliminar</Modal.Header>
                      <Modal.Body>
                        Esta seguro de eliminar el festivo
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="outline-primary" onClick={(rowid) => this.remove(rowId)}>Eliminar</Button>{' '}
                        <Button variant="outline-secondary" onClick={this.toggle}>Cancelar</Button>
                      </Modal.Footer>
                    </Modal>;
    return (
      <div>
        {modal }
        <AppNavbar/>
        <Container className="App">
          <h2>Festivos</h2>
          <Form className="form">
            <Col>
              <Container className="App">
                <h5>Festivo</h5>
                <Row>                  
                  <Col sm="1">                  
                      <Form.Label>Fecha</Form.Label>
                  </Col>
                  <Col>
                  <Datetime
                          dateFormat={DATE_FORMAT}
                          timeFormat={false}
                          onChange={this.handleDate} />
                        {messageFestivo }
                  </Col>
                </Row>
              </Container>
            </Col>
            <Col>
              <Container className="App">                
                <Row>                  
                  <Col><h5>Festivos</h5></Col>                  
                  <Col sm="2">                  
                      <Form.Control
                        as="select"
                        onChange={(e) => {
                          this.handleChange(e.target.value, "ano");
                        }}
                        value={fields.ano}>
                        <option value='null'>Seleccionar</option>
                        {optionAnos }
                      </Form.Control>                  
                  </Col>
                  </Row>                
                  <Row>
                    <Col>
                      <Form.Group>
                        <BootstrapTable
                          keyField='id'
                          data={ festivos }
                          columns={ columns }
                          selectRow={ selectRow }
                          pagination={ paginationFactory(options)} />
                      </Form.Group>
                    </Col>
                  </Row>
              </Container>
            </Col>
            <Col>
            <Form.Group>
              <Button variant="outline-primary" onClick={this.validateRequired} >Guardar</Button>{'    '}
              <Button variant="outline-primary" disabled={!this.state.isExistData} onClick={this.toggle} >Eliminar</Button>
            </Form.Group>
            </Col>
            <Col>
             {messageLabel }
            </Col>
          </Form >
        </Container>
      </div>
    );
  }
}

export default Festivos;