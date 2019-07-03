import React, { Component } from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import Websocket from "react-websocket";
import { connect } from "react-redux";
import { reiniciarCompra } from "../../actions/identificacionActions";
import {
  registrarCompra,
  consultarTiraAuditoria
} from "../../actions/compraActions";
import { iniciarCompra } from "../../actions/cantidadActions";
import Spinner from "../common/Spinner";

class Compra extends Component {
  constructor() {
    super();
    this.state = {
      show: false,
      imprimir: false,
      data: "",
      pagoExitoso: false,
      beneficiario: {},
      compra: {
        contrato: {},
        numeroAprobacion: "",
        tiraAuditora: {}
      },
      errors: {},
      timeOut: null,
      registro: false,
      imprimio: false,
      vales: "",
      procesoCompra: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  componentDidMount() {
    if (!this.props.compra.inicioCompra) {
      this.props.history.push("/");
    }
    this.setState({
      beneficiario: this.props.beneficiario,
      compra: this.props.compra
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !this.props.compra.cargando &&
      this.props.compra.tiraAuditora.textoHtml
    ) {
      if (!this.state.imprimio) {
        this.PrintElem("tira");
        const props = this.props;
        this.setState({ imprimio: true });
        this.timeOut = setTimeout(function() {
          props.reiniciarCompra({});
        }, 15000);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors !== this.props.errors) {
      this.setState({ errors: nextProps.errors });

      const props = this.props;
      if (!this.isEmpty(nextProps.errors)) {
        let tiempo = setTimeout(function() {
          props.reiniciarCompra({});
        }, 15000);
        this.timeOut = tiempo;
      }
    }

    if (!nextProps.compra.inicioCompra) {
      this.props.history.push("/");
    }

    if (this.props.compra.transaccion !== nextProps.compra.transaccion) {
      console.log("cambio transaccion");
      if (nextProps.compra.transaccion) {
        console.log("existe next props transaccion");
        let compra = Object.assign({}, this.props.compra); //creating copy of object
        this.setState({ compra });
        if (!this.props.compra.transaccion) {
          console.log("props transaccion no existe");
          if (!this.state.registro) {
            console.log("Imprimio 1:", this.imprimio);
            this.setState({ registro: true });
            console.log("Imprimio 2:", this.imprimio);
            this.props.consultarTiraAuditoria(nextProps.compra);
            console.log("Imprimio 3:", this.imprimio);
          }
        }
      }
    }

    if (
      this.props.compra.valeElectronico !== nextProps.compra.valeElectronico
    ) {
      if (this.props.compra.valeElectronico.length > 0) {
        let vales =
          "El número de su(s) Vale(s) es: " +
          this.props.compra.valeElectronico[0].Vales.codigoVale;
        for (let i = 1; i < this.props.compra.valeElectronico.length; i++) {
          vales += ", " + this.props.compra.valeElectronico[i].Vales.codigoVale;
        }
        this.setState({ vales: vales });
      }
    }
  }

  handleShow() {
    this.setState({ show: true });
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onKeyPress = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleChange(event) {
    this.setState({
      tipoIdentificacion: event.target.value
    });
  }

  handleData(data) {
    //let result = JSON.parse(data);
    //this.setState({ count: this.state.count + result.movement });
    if (!this.state.procesoCompra) {
      this.setState({ procesoCompra: true });
      const respuesta = JSON.parse(data);
      if (respuesta.reintentar) {
        this.props.iniciarCompra(this.props.compra);
      } else {
        this.setState({
          data: respuesta.message,
          pagoExitoso: respuesta.pagoExitoso,
          show: true
        });
        if (this.state.pagoExitoso) {
          let compra = Object.assign({}, this.state.compra); //creating copy of object
          compra.numeroAprobacion = respuesta.numeroAprobacion;
          console.log("Registrando compra:", compra);
          this.props.registrarCompra(this.state.beneficiario, compra);
        } else {
          const props = this.props;
          this.timeOut = setTimeout(function() {
            props.reiniciarCompra({});
          }, 15000);
        }
      }
    }
  }

  handleClose(e) {
    e.preventDefault();
    clearTimeout(this.timeOut);
    if (e.target.value === "REINTENTAR") {
      //this.props.history.push("/cantidad");
      this.props.iniciarCompra(this.props.compra);
      this.setState({ show: false, procesoCompra: false });
    } else if (e.target.value === "IMPRIMIR") {
      console.log("Vamos a imprimir");
      this.props.consultarTiraAuditoria(this.props.compra);
    } else if (e.target.value === "SALIR") {
      this.setState({ show: false, procesoCompra: false });
      this.props.reiniciarCompra({});
    }
  }

  PrintElem(elem) {
    var mywindow = window.open("", "PRINT", "height=400,width=600");

    mywindow.document.write(
      "<html><head><title>" + document.title + "</title>"
    );
    mywindow.document.write("</head><body");
    mywindow.document.write(document.getElementById("tira").innerHTML);
    mywindow.document.write("</body></html>");

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
  }

  render() {
    const {
      compra,
      beneficiario,
      imprimir,
      pagoExitoso,
      show,
      errors
    } = this.state;
    const textoTiraAuditora = this.props.compra.tiraAuditora.textoHtml;
    let botonFinal;
    let instrucciones;
    let contenido;

    if (pagoExitoso) {
      if (imprimir) {
        botonFinal = (
          <Button
            id="imprimir"
            style={{
              width: "263px",
              height: "101px"
            }}
            onClick={this.handleClose}
            value="IMPRIMIR"
          />
        );
      }
    } else {
      botonFinal = (
        <div>
          <Button
            id="salir"
            style={{
              width: "263px",
              height: "101px"
            }}
            onClick={this.handleClose}
            value="SALIR"
          />
          <Button
            id="reintentar"
            style={{
              width: "263px",
              height: "101px"
            }}
            className="btn btn-primary"
            onClick={this.handleClose}
            value="REINTENTAR"
          />
        </div>
      );
    }
    let spinner = this.props.compra.cargando ? (
      <div id="spinner_compra">
        <Spinner />
        <p id="imprimiendo">&nbsp;Imprimiendo comprobante...</p>
      </div>
    ) : (
      <div />
    );

    if (!show) {
      instrucciones = (
        <img
          id="instrucciones"
          src="../../img/instrucciones_3.jpg"
          width="80%"
          height="950px"
          alt=""
        />
      );
    } else {
      instrucciones = (
        <div id="resultado">
          <img
            id="icono"
            src={
              pagoExitoso
                ? "./img/buttons/exito.png"
                : "./img/buttons/cancelado.png"
            }
            alt=""
          />
          <p id="mensaje_final">{this.state.data}</p>
          <p id="mensaje_vales">{this.state.vales}</p>
          {botonFinal}
          {spinner}

          {errors.mensaje && (
            <div id="error_message_compra" className="alert alert-info">
              {errors.mensaje}
            </div>
          )}
        </div>
      );
    }

    contenido = instrucciones;

    /*if (!this.props.compra.cargando) {
      contenido = instrucciones;
    } else {
      contenido = (
        <div>
          <Spinner />
        </div>
      );
    }*/

    return (
      <div className="principal">
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
        <p id="info_compra">
          Cantidad de Vales: {compra.cantidad}, Valor Total: $
          {compra.valorTotal}
        </p>

        {contenido}

        <div className="otro">
          <div id="tdocumento">
            <div id="mensaje-compra">
              <Websocket
                url="ws://localhost:5000"
                onMessage={this.handleData.bind(this)}
              />
            </div>
          </div>
        </div>
        <Button
          id="home_button_compra"
          style={{
            width: "250px",
            height: "101px"
          }}
          onClick={this.handleClose}
          value="SALIR"
        />

        <div id="tira" style={{ display: "none" }}>
          <p dangerouslySetInnerHTML={{ __html: textoTiraAuditora }} />
        </div>
      </div>
    );
  }
}

Compra.propTypes = {
  reiniciarCompra: PropTypes.func.isRequired,
  registrarCompra: PropTypes.func.isRequired,
  consultarTiraAuditoria: PropTypes.func.isRequired,
  iniciarCompra: PropTypes.func.isRequired,
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
  { reiniciarCompra, registrarCompra, consultarTiraAuditoria, iniciarCompra }
)(Compra);
