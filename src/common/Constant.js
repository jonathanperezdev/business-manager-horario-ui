import Moment from 'moment';

const HORARIO_API = '/horario/v1/api';

//Periodo Pago
const PERIODO_PAGO_SERVICE = '/periodoPago/';

//Horario Empleado
const HORARIO_EMPLEADO_SERVICE = '/empleado/';

//General
const DATE_FORMAT = Moment.HTML5_FMT.DATE;
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const TIME_FORMAT = Moment.HTML5_FMT.TIME;

//Table options
const OPTIONS_TABLE = {
  alwaysShowAllBtns: false,
  hideSizePerPage: true,
  firstPageText: '<<',
  prePageText: '<',
  nextPageText: '>',
  lastPageText: '>>',
  showTotal: false
};

class Constant {

  static get HORARIO_API() {
    return HORARIO_API;
  }

  //Periodo de pago
  static get PERIODO_PAGO_SERVICE() {
    return PERIODO_PAGO_SERVICE;
  }

  //Horario Empleado
  static get HORARIO_EMPLEADO_SERVICE() {
    return HORARIO_EMPLEADO_SERVICE;
  }

  //Table options
  static get OPTIONS_TABLE() {
    return OPTIONS_TABLE;
  }

  //General
  static get DATE_FORMAT() {
    return DATE_FORMAT;
  }
  static get DATE_TIME_FORMAT() {
    return DATE_TIME_FORMAT;
  }
  static get TIME_FORMAT() {
    return TIME_FORMAT;
  }
}

export default Constant;
