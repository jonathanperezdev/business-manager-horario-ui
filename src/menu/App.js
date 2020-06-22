import React, { Component } from 'react';
import 'css/App.css';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Parametros from 'components/parametros/Parametros';
import Festivos from 'components/festivos/Festivos';
import HorarioUbicacion from 'components/horarioUbicacion/HorarioUbicacion';
import EditarHorarioUbicacion from 'components/horarioUbicacion/EditarHorarioUbicacion';
import PeriodoPago from 'components/periodoPago/PeriodoPago';
import HorarioEmpleado from 'components/periodoPago/HorarioEmpleado';
import EditarHorarioEmpleado from 'components/periodoPago/EditarHorarioEmpleado';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path='/' exact={true} component={Home}/>
          <Route path='/parametros' exact={true} component={Parametros}/>
          <Route path='/festivos' exact={true} component={Festivos}/>
          <Route path='/horarioUbicacion' exact={true} component={HorarioUbicacion}/>
          <Route path='/horarioUbicacion/:id' exact={true} component={EditarHorarioUbicacion}/>
          <Route path='/periodoPago' exact={true} component={PeriodoPago}/>
          <Route path='/horarioEmpleado/:id' exact={true} component={HorarioEmpleado}/>
          <Route path='/editarHorarioEmpleado/:idEmpleado/:idUbicacion/:idSemana' exact={true} component={EditarHorarioEmpleado}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
