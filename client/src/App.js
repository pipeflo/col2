import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

import Principal from './components/inicio/Principal';
import Servicio from './components/inicio/Servicio';
import Ventanilla from './components/inicio/Ventanilla';
import Inicio from './components/inicio/Inicio';
import InicioCli from './components/inicio/InicioCli';
import Identificacion from './components/identificacion/Identificacion';
import IdentificacionCli from './components/identificacion/IdentificacionCli';
import Vale from './components/cantidad/Vale';
import Cantidad from './components/cantidad/Cantidad';
import CantidadCli from './components/cantidad/CantidadCli';
import Compra from './components/compra/Compra';
import Citas from './components/citas/Citas';
import Contratos from './components/contratos/Contratos';
import Configuracion from './components/configuracion/Configuracion';

import './App.css';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className='App'>
            <Route exact path='/' component={Principal} />
            <Route exact path='/servicio' component={Servicio} />
            <Route exact path='/ventanilla' component={Ventanilla} />
            <Route exact path='/inicio' component={Inicio} />
            <Route exact path='/inicioCli' component={InicioCli} />
            <Route exact path='/identificacion' component={Identificacion} />
            <Route
              exact
              path='/identificacionCli'
              component={IdentificacionCli}
            />
            <Route exact path='/citas' component={Citas} />
            <Route exact path='/vale' component={Vale} />
            <Route exact path='/contratos' component={Contratos} />
            <Route exact path='/cantidad' component={Cantidad} />
            <Route exact path='/cantidadCli' component={CantidadCli} />
            <Route exact path='/compra' component={Compra} />
            <Route exact path='/configuracion' component={Configuracion} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
