import React, { Component } from "react";
import { Container, Col, FormGroup, Label, Input, Row} from 'reactstrap';
import Constant from "common/Constant";
import Datetime from "react-datetime";
import Moment from 'moment';

const TIME_FORMAT = Constant.TIME_FORMAT;
const DATE_FORMAT = Constant.DATE_FORMAT;

class HorarioDiaComponent extends Component {
  render() {
    let {handleTime, dia, fields} = this.props;

    let diaHorario = fields.horarioSemana ? fields.horarioSemana[dia] : null;

    let fechaInicio = diaHorario ? Moment(diaHorario.fechaInicio).format(DATE_FORMAT) : '';
    let horaInicio = diaHorario ? Moment(diaHorario.fechaInicio).format(TIME_FORMAT) : null;

    let fechaFin = diaHorario ? Moment(diaHorario.fechaFin).format(DATE_FORMAT) : '';
    let horaFin = diaHorario ? Moment(diaHorario.fechaFin).format(TIME_FORMAT) : null;

    return (
      <Row>
        <Col sm="2">
          <h5>&nbsp;</h5>
          <h5>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h5>
        </Col>
        <Col sm="3">
          <FormGroup>
            <Label>Hora Inicio</Label>
            <Row>
              <Col>
                <Input type="text"
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
          </FormGroup>
        </Col>
        <Col sm="3">
          <FormGroup>
            <Label>Hora Fin</Label>
              <Row>
                <Col>
                  <Input type="text"
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
          </FormGroup>
        </Col>
        <Col sm="1">
          <Label>Horas</Label>
          <Input type="text"
            disabled
            value={diaHorario ? diaHorario.horas : 0}/>
        </Col>
        <Col>
          <Label>Recargos</Label>
          <Input type="text"
            disabled
            value={diaHorario ? diaHorario.deatelleHoras : ''}/>
        </Col>
      </Row>
    );
  }
}

export default HorarioDiaComponent;
