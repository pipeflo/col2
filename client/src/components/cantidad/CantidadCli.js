import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { iniciarCompra } from '../../actions/cantidadActions';
import { reiniciarCompra } from '../../actions/identificacionActions';

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
    console.log('Entro a cantidad');
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  componentDidMount() {
    if (this.props.compra.valorVale === 0) {
      this.props.history.push('/identificacion');
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
      console.log('Populo compra');
      this.props.history.push('/compra');
    }

    if (nextProps.beneficiario.contratos.length === 0) {
      this.props.history.push('/');
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
    switch (e.target.value) {
      case 'Si':
        console.log('Iniciar compra para 1 vales');
        const compraData = {
          idTransaccion: Math.floor(Math.random() * 1000000 + 1),
          cantidad: 1,
          valorVale: this.state.compra.valorVale,
          valorTotal:
            parseInt(this.state.compra.cantidad) *
            parseInt(this.state.compra.valorVale),
          codigoCompania: this.state.compra.contrato.codigoCompania
        };

        this.props.iniciarCompra(compraData);
        break;
      case 'No':
        console.log('Dio click en No');
        this.props.history.push('/ventanilla');
        break;
      case 'SALIR':
        this.props.reiniciarCompra({});
        break;
      default:
        console.log('Dio click en boton:', e.target.value);
        break;
    }
    if (e.target.value === 'BORRAR') {
      let compra = Object.assign({}, this.state.compra); //creating copy of object
      compra.cantidad = 0; //updating value
      this.setState({ compra });
    } else if (e.target.value === 'ACEPTAR') {
    } else if (e.target.value === 'SALIR') {
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
      width: '276px',
      height: '120px',
      marginBottom: '20px',
      marginRight: '20px',
      fontSize: '45px',
      backgroundSize: 'cover'
    };

    return (
      <div>
        <img
          id='fondo_principal'
          src='../../img/colsanitas_soft-pag_2.jpg'
          width='748'
          height='1366'
          alt=''
        />
        <p id='nombre_cliente'>{beneficiario.nombre} </p>
        <p id='info_contrato'>
          {compra.contrato.nombreProducto} No. Contrato:{' '}
          {compra.contrato.numeroContrato}
        </p>
        <p id='txt_precio'>
          PRECIO
          <br />${compra.valorVale}
        </p>
        <p id='txt_precio_2'>¿Desea realizar la Compra?</p>
        <div id='keyboardSN' className='form-group'>
          <Button
            id='btn_si'
            style={numeroStyle}
            onClick={this.onClick}
            value='Si'
          >
          </Button>

          <Button
            id='btn_no'
            style={numeroStyle}
            onClick={this.onClick}
            value='No'
          >
          </Button>
        </div>
        <Button
          id='home_button'
          style={{
            width: '250px',
            height: '101px'
          }}
          onClick={this.onClick}
          value='SALIR'
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
