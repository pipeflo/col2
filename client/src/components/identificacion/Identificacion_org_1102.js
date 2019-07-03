import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import classnames from "classnames";
import { connect } from "react-redux";
import {
  buscarBenediciario,
  reiniciarCompra
} from "../../actions/identificacionActions";
import Spinner from "../common/Spinner";

class Identificacion extends Component {
  constructor() {
    super();
    this.state = {
      nombre: "",
      tipoIdentificacion: "",
      codTipoIdentificacion: "",
      tipoIdentificacionNombre: "",
      numeroIdentificacion: "",
      contratos: [],
      cargando: false,
      errors: {},
      timeOut: null
    };
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  componentDidMount() {
    if (!this.props.beneficiario.tipoIdentificacion) {
      this.props.history.push("/");
    } else {
      this.setState({
        codTipoIdentificacion: this.props.beneficiario.codTipoIdentificacion,
        tipoIdentificacion: this.props.beneficiario.tipoIdentificacion,
        tipoIdentificacionNombre: this.props.beneficiario
          .tipoIdentificacionNombre
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
      if (nextProps.errors !== this.props.errors) {
        const props = this.props;
        if (!this.isEmpty(nextProps.errors)) {
          let tiempo = setTimeout(function() {
            props.reiniciarCompra({});
          }, 10000);
          this.timeOut = tiempo;
        }
      }
    }

    if (nextProps.beneficiario.contratos.length > 0) {
      this.props.history.push("/contratos");
    }

    if (!nextProps.beneficiario.tipoIdentificacion) {
      this.props.history.push("/");
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onKeyPress = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onClick = e => {
    e.preventDefault();
    clearTimeout(this.timeOut);
    if (e.target.value === "BORRAR") {
      this.setState({ numeroIdentificacion: "" });
    } else if (e.target.value === "ACEPTAR") {
      const identificacionData = {
        numeroIdentificacion: this.state.numeroIdentificacion,
        tipoIdentificacion: this.state.tipoIdentificacion,
        codTipoIdentificacion: this.state.codTipoIdentificacion,
        tipoIdentificacionNombre: this.state.tipoIdentificacionNombre
      };

      this.props.buscarBenediciario(identificacionData);
    } else if (e.target.value === "SALIR") {
      this.props.reiniciarCompra({});
    } else {
      this.setState({
        numeroIdentificacion: this.state.numeroIdentificacion + e.target.value
      });
    }
  };

  render() {
    const { errors } = this.state;
    const { cargando } = this.props.beneficiario;

    const numeroStyle = {
      width: "120px",
      height: "120px",
      marginBottom: "20px",
      marginRight: "20px",
      fontSize: "45px",
      backgroundSize: "cover"
    };

    let contenido;

    if (cargando) {
      contenido = (
        <div className="principal">
          <img
            id="fondo_principal"
            src="../../img/colsanitas_soft-pag_2.jpg"
            width="748"
            height="1366"
            alt=""
          />
          <Spinner />
        </div>
      );
    } else {
      contenido = (
        <div className="principal">
          <img
            id="fondo_principal"
            src="../../img/colsanitas_soft-pag_2.jpg"
            width="748"
            height="1366"
            alt=""
          />

          {errors.numeroIdentificacion && (
            <div id="error_message" className="alert alert-info">
              {errors.numeroIdentificacion}
            </div>
          )}
          {errors.mensaje && (
            <div id="error_message" className="alert alert-info">
              {errors.mensaje}
            </div>
          )}

          <p id="tcedula">Digite su número de Identificación</p>
          <img id="imark" src="../../img/input_mark.png" alt="" />

          <label htmlFor="usr">
            <input
              type="text"
              className={classnames("form-control identificacion", {
                "is-invalid": errors.numeroIdentificacion
              })}
              id="usr"
              placeholder=""
              name="identificacion"
              value={this.state.numeroIdentificacion}
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
            />
          </label>

          <div id="keyboard" className="form-group">
            <Button
              id="uno"
              style={numeroStyle}
              onClick={this.onClick}
              value="1"
            />
            <Button
              id="dos"
              style={numeroStyle}
              onClick={this.onClick}
              value="2"
            />
            <Button
              id="tres"
              style={numeroStyle}
              onClick={this.onClick}
              value="3"
            />
            <Button
              id="cuatro"
              style={numeroStyle}
              onClick={this.onClick}
              value="4"
            />
            <Button
              id="cinco"
              style={numeroStyle}
              onClick={this.onClick}
              value="5"
            />
            <Button
              id="seis"
              style={numeroStyle}
              onClick={this.onClick}
              value="6"
            />
            <Button
              id="siete"
              style={numeroStyle}
              onClick={this.onClick}
              value="7"
            />
            <Button
              id="ocho"
              style={numeroStyle}
              onClick={this.onClick}
              value="8"
            />
            <Button
              id="nueve"
              style={numeroStyle}
              onClick={this.onClick}
              value="9"
            />

            <Button
              id="cero"
              style={numeroStyle}
              onClick={this.onClick}
              value="0"
            />
          </div>
          <div id="aceptar_borrar">
            <Button
              id="borrar_button"
              style={{
                width: "263px",
                height: "90px"
              }}
              onClick={this.onClick}
              value="BORRAR"
            />
            <Button
              id="aceptar_button"
              style={{
                width: "263px",
                height: "101px"
              }}
              onClick={this.onClick}
              value="ACEPTAR"
            />
          </div>
          <Button
            id="home_button"
            style={{
              width: "250px",
              height: "101px"
            }}
            onClick={this.onClick}
            value="SALIR"
          />
        </div>
      );
    }

    return contenido;
  }
}

Identificacion.propTypes = {
  buscarBenediciario: PropTypes.func.isRequired,
  reiniciarCompra: PropTypes.func.isRequired,
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
  { buscarBenediciario, reiniciarCompra }
)(Identificacion);
