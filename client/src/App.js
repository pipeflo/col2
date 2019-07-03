import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";

import Principal from "./components/inicio/Principal";
import Inicio from "./components/inicio/Inicio";
import Identificacion from "./components/identificacion/Identificacion";
import Cantidad from "./components/cantidad/Cantidad";
import Compra from "./components/compra/Compra";
import Contratos from "./components/contratos/Contratos";
import Configuracion from "./components/configuracion/Configuracion";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Route exact path="/" component={Principal} />
            <Route exact path="/inicio" component={Inicio} />
            <Route exact path="/identificacion" component={Identificacion} />
            <Route exact path="/contratos" component={Contratos} />
            <Route exact path="/cantidad" component={Cantidad} />
            <Route exact path="/compra" component={Compra} />
            <Route exact path="/configuracion" component={Configuracion} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
