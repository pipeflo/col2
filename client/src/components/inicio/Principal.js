import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  traerTiposIdentificacion,
  asignarTipoIdentificacion
} from "../../actions/inicioActions";

class Inicio extends Component {
  constructor() {
    super();
    this.state = {};
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();

    const codTipoIdentificacion = e.target.getAttribute("value");

    this.props.asignarTipoIdentificacion(
      this.props.tiposIdentificacion.tipos[codTipoIdentificacion]
    );
  }

  render() {
    return (
      <Link to="/inicio">
        <div className="principal">
          <img
            id="fondo_principal"
            src="../../img/colsanitas_soft-pag_1.jpg"
            width="748"
            height="1366"
            alt=""
          />
        </div>
      </Link>
    );
  }
}

Inicio.propTypes = {
  traerTiposIdentificacion: PropTypes.func.isRequired,
  asignarTipoIdentificacion: PropTypes.func.isRequired,
  tiposIdentificacion: PropTypes.object.isRequired,
  beneficiario: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  tiposIdentificacion: state.tiposIdentificacion,
  beneficiario: state.beneficiario,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { traerTiposIdentificacion, asignarTipoIdentificacion }
)(Inicio);
