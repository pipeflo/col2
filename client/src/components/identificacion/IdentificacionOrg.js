import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { connect } from "react-redux";
import { buscarBenediciario } from "../../actions/identificacionActions";
import Spinner from "../common/Spinner";

class Identificacion extends Component {
  constructor() {
    super();
    this.state = {
      nombre: "",
      tipoIdentificacion: "",
      numeroIdentificacion: "",
      contratos: [],
      cargando: false,
      errors: {}
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }

    if (nextProps.beneficiario.contratos.length > 0) {
      this.props.history.push("/cantidad");
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    console.log("selecciono ", e.target.value);
  };

  onKeyPress = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleChange(event) {
    this.setState({
      tipoIdentificacion: event.target.value
    });
  }

  onClick = e => {
    e.preventDefault();
    if (e.target.value === "BORRAR") {
      this.setState({ numeroIdentificacion: "" });
    } else if (e.target.value === "ACEPTAR") {
      const identificacionData = {
        numeroIdentificacion: this.state.numeroIdentificacion,
        tipoIdentificacion: this.state.tipoIdentificacion
      };

      this.props.buscarBenediciario(identificacionData);
    } else {
      console.log("Pico en numero");
      this.setState({
        numeroIdentificacion: this.state.numeroIdentificacion + e.target.value
      });
    }
  };

  render() {
    const { errors } = this.state;
    const { cargando } = this.props.beneficiario;

    let contenido;

    if (cargando) {
      contenido = (
        <div className="text-center fondoIdentificacion">
          <div className="otro">
            <Spinner />
          </div>
        </div>
      );
    } else {
      contenido = (
        <div className="text-center fondoIdentificacion">
          <div className="otro">
            <div className="tdocumento">
              <p>Escoja su tipo de documento</p>
            </div>
            <div className="btn-group-toggle row radiobuttonsrow">
              <div className="col-sm">
                <label className="btn btn-primary active radioDocumento">
                  <input
                    type="radio"
                    value="CC"
                    checked={this.state.tipoIdentificacion === "CC"}
                    onChange={this.handleChange}
                  />{" "}
                  Cédula de Ciudadanía
                </label>
              </div>
              <div className="col-sm">
                <label className="btn btn-primary radioDocumento">
                  <input
                    type="radio"
                    value="CE"
                    checked={this.state.tipoIdentificacion === "CE"}
                    onChange={this.handleChange}
                  />{" "}
                  Cédula de Extranjería
                </label>
              </div>
              <div className="col-sm">
                <label className="btn btn-primary radioDocumento">
                  <input
                    type="radio"
                    value="Pasaporte"
                    checked={this.state.tipoIdentificacion === "Pasaporte"}
                    onChange={this.handleChange}
                  />
                  Pasaporte
                </label>
              </div>
              {errors.tipoIdentificacion && (
                <div className="error-message">{errors.tipoIdentificacion}</div>
              )}
            </div>

            <div className="tcedula">
              <p>Digite su número de Identificación</p>
            </div>

            <div className="inputIdentificacion">
              <input
                type="text"
                className={classnames("form-control identificacion", {
                  "is-invalid": errors.numeroIdentificacion
                })}
                placeholder="Número de Identificación"
                name="identificacion"
                value={this.state.numeroIdentificacion}
                onChange={this.onChange}
                onKeyPress={this.onKeyPress}
              />
              {errors.numeroIdentificacion && (
                <div className="invalid-feedback">
                  {errors.numeroIdentificacion}
                </div>
              )}
              {errors.mensaje && (
                <div className="error-message">{errors.mensaje}</div>
              )}
            </div>

            <div className="row keyboard">
              <div className="row">
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary float-right numero"
                    value="1"
                    onClick={this.onClick}
                  />
                </div>
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary numero"
                    value="2"
                    onClick={this.onClick}
                  />
                </div>
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary float-left numero"
                    value="3"
                    onClick={this.onClick}
                  />
                </div>
              </div>
              <br />
              <div className="row">
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary float-right numero"
                    value="4"
                    onClick={this.onClick}
                  />
                </div>
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary numero"
                    value="5"
                    onClick={this.onClick}
                  />
                </div>
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary float-left numero"
                    value="6"
                    onClick={this.onClick}
                  />
                </div>
              </div>
              <br />
              <div className="row">
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary float-right numero"
                    value="7"
                    onClick={this.onClick}
                  />
                </div>
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary numero"
                    value="8"
                    onClick={this.onClick}
                  />
                </div>
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary float-left numero"
                    value="9"
                    onClick={this.onClick}
                  />
                </div>
              </div>
              <br />
              <div className="row">
                <div className="col" />
                <div className="col">
                  <input
                    type="button"
                    className="btn btn-primary numero"
                    value="0"
                    onClick={this.onClick}
                  />
                </div>
                <div className="col" />
              </div>
            </div>

            <div className="form-group keyboard_2">
              <input
                className="btn btn-primary aceptar"
                type="button"
                value="ACEPTAR"
                onClick={this.onClick}
              />
              <br />
              <input
                className="btn btn-primary eliminar"
                type="button"
                value="BORRAR"
                onClick={this.onClick}
              />
            </div>
          </div>
        </div>
      );
    }

    return contenido;
  }
}

Identificacion.propTypes = {
  buscarBenediciario: PropTypes.func.isRequired,
  beneficiario: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  beneficiario: state.beneficiario,
  cargando: state.cargando,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { buscarBenediciario }
)(Identificacion);
