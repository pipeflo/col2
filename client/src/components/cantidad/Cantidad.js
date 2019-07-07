import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";
import { iniciarCompra } from "../../actions/cantidadActions";
import { reiniciarCompra } from "../../actions/identificacionActions";

class Cantidad extends Component {
  constructor() {
    super();
    this.state = {
      beneficiario: {},
      compra: {
        contrato: {},
        cantidad: 0,
        valorTotal: 0
      },
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
    if (this.props.compra.valorVale === 0) {
      this.props.history.push("/identificacion");
    }
    this.setState({
      beneficiario: this.props.beneficiario,
      compra: this.props.compra
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors !== this.props.errors) {
      this.setState({ errors: nextProps.errors });

      const props = this.props;
      if (!this.isEmpty(nextProps.errors)) {
        let tiempo = setTimeout(function() {
          props.reiniciarCompra({});
        }, 10000);
        this.timeOut = tiempo;
      }
    }

    if (nextProps.compra.inicioCompra) {
      console.log("Populo compra");
      this.props.history.push("/compra");
    }

    if (nextProps.beneficiario.contratos.length === 0) {
      this.props.history.push("/");
    }
  }

  onKeyPress = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onClick = e => {
    e.preventDefault();
    clearTimeout(this.timeOut);
    if (e.target.value === "BORRAR") {
      let compra = Object.assign({}, this.state.compra); //creating copy of object
      compra.cantidad = 0; //updating value
      this.setState({ compra });
    } else if (e.target.value === "ACEPTAR") {
      console.log("Iniciar compra para ", this.state.compra.cantidad, "vales");
      const compraData = {
        idTransaccion: Math.floor(Math.random() * 1000000 + 1),
        cantidad: this.state.compra.cantidad,
        valorVale: this.state.compra.valorVale,
        valorTotal:
          parseInt(this.state.compra.cantidad) *
          parseInt(this.state.compra.valorVale),
        codigoCompania: this.state.compra.contrato.codigoCompania
      };

      this.props.iniciarCompra(compraData);
    } else if (e.target.value === "SALIR") {
      this.props.reiniciarCompra({});
    } else {
      if (this.state.compra.cantidad === 0) {
        let compra = Object.assign({}, this.state.compra); //creating copy of object
        compra.cantidad = e.target.value; //updating value
        this.setState({ compra });
      } else {
        let compra = Object.assign({}, this.state.compra); //creating copy of object
        compra.cantidad = this.state.compra.cantidad + e.target.value; //updating value
        this.setState({ compra });
      }
    }
  };

  render() {
    const { errors, beneficiario, compra } = this.state;
    const numeroStyle = {
      width: "120px",
      height: "120px",
      marginBottom: "20px",
      marginRight: "20px",
      fontSize: "45px",
      backgroundSize: "cover"
    };

    return (
      <div>
        <img
          id="fondo_principal"
          src="../../img/colsanitas_soft-pag_2.jpg"
          width="748"
          height="1366"
          alt=""
        />
        <p id="nombre_cliente">{beneficiario.nombre} </p>
        <p id="info_contrato">
          {compra.contrato.nombreProducto} No. Contrato:{" "}
          {compra.contrato.numeroContrato}
        </p>
        <hr id="hr_1" color="white" size="2" width="600" />
        <p id="vale">Valor del vale: ${compra.valorVale}</p>
        <p id="cantidad">Cantidad: {compra.cantidad}</p>
        <hr id="hr_2" color="white" size="2" width="600" />
        <p id="total">
          TOTAL: ${parseInt(compra.cantidad) * parseInt(compra.valorVale)}
        </p>
        <p id="tcompra">Indique el número de vales a comprar</p>
        <img id="imarkCantidad" src="../../img/input_mark.png" alt="" />
        <input
          type="text"
          className="form-control"
          id="usrCantidad"
          placeholder="Cantidad de Vales"
          name="cantidad"
          value={this.state.compra.cantidad}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
        />
        {errors.cantidad && (
          <div id="error_message_cantidad" className="alert alert-info">
            {errors.cantidad}
          </div>
        )}
        <div id="keyboardCantidad" className="form-group">
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
        <div id="aceptar_borrar_cantidad">
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
}

Cantidad.propTypes = {
  iniciarCompra: PropTypes.func.isRequired,
  reiniciarCompra: PropTypes.func.isRequired,
  beneficiario: PropTypes.object.isRequired,
  compra: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  beneficiario: state.beneficiario,
  compra: state.compra,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { iniciarCompra, reiniciarCompra }
)(Cantidad);
