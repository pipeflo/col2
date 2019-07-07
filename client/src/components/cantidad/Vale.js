import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { agregarContrato, setErrors } from '../../actions/contratosActions';
import { reiniciarCompra } from '../../actions/identificacionActions';
import Spinner from '../common/Spinner';

class Vale extends Component {
  constructor() {
    super();
    this.state = {
      nombre: '',
      numeroIdentificacion: '',
      tipoIdentificacion: '',
      vale: {},
      contratos: [],
      beneficiario: {},
      compra: {},
      errors: {},
      contratoSinOpcionDeCompra: false,
      timeOut: null
    };
    this.onClick = this.onClick.bind(this);
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  componentDidMount() {
    if (this.isEmpty(this.props.beneficiario.vale)) {
      this.props.history.push('/identificacionCli');
    } else {
      if (!this.props.beneficiario.vale.tiene) {
        this.props.history.push('/identificacionCli');
      }
    }

    this.setState({
      nombre: this.props.beneficiario.nombre,
      numeroIdentificacion: this.props.beneficiario.numeroIdentificacion,
      tipoIdentificacion: this.props.beneficiario.tipoIdentificacion,
      contratos: this.props.beneficiario.contratos,
      vale: this.props.beneficiario.vale
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
      if (nextProps.errors !== this.props.errors) {
        const props = this.props;
        if (!this.isEmpty(nextProps.errors)) {
          console.log('Entro con error');
          let tiempo = setTimeout(function() {
            props.reiniciarCompra({});
          }, 10000);
          console.log(tiempo);
          this.timeOut = tiempo;
          console.log(this.timeOut);
        }
      }
    }

    if (nextProps.beneficiario.contratos.length === 0) {
      this.props.history.push('/');
    }

    if (nextProps.compra.valorVale) {
      this.props.history.push('/cantidadCli');
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    console.log('selecciono ', e.target.value);
  };

  onKeyPress = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleChange(event) {
    this.setState({
      tipoIdentificacion: event.target.value
    });
  }

  onClick(e) {
    e.preventDefault();
    clearTimeout(this.timeOut);
    switch (e.target.getAttribute('value')) {
      case 'SALIR':
        this.props.reiniciarCompra({});
        break;
      case 'Si':
        //Vamos a registrar ingreso con vale del beneficiario
        break;
      case 'No':
        //No desea utilizar los vales vigentes, enviamos a traer precio
        this.props.agregarContrato(
          this.props.beneficiario.contratos[0],
          this.props.beneficiario
        );
        break;
      default:
        const valueBoton = e.target.getAttribute('value')
          ? e.target.getAttribute('value')
          : e.target.parentNode.getAttribute('value');
        console.log('dio click en ', valueBoton);
      /*const errors = {
                  mensaje: this.props.beneficiario.contratos[indexContrato].error
                };
                this.props.setErrors(errors);*/
    }
  }

  render() {
    const { cargando } = this.props.compra;
    const { nombre, errors } = this.state;
    const funciones = { onClick: this.onClick };
    const styleContratos = { fontWeight: 'bold' };
    let htmlConfirmaUsoVale = (
      <div>
        <Link
          key='1'
          style={{
            width: '250px',
            height: '250px',
            marginBottom: '30px',
            marginRight: '30px',
            fontSize: '16px',
            textAlign: 'left',
            alignContent: 'center',
            color: 'black',
            whiteSpace: 'normal',
            overflowWrap: 'break-word'
          }}
          value='Si'
          id='btn_contrato'
          className='btn btn-primary boton_contrato'
          onClick={funciones.onClick}
          to='#'
        >
          <br />
          <br />
          <span style={styleContratos} value='Si'>
            {'Si'}
          </span>
        </Link>
        <Link
          key='2'
          style={{
            width: '250px',
            height: '250px',
            marginBottom: '30px',
            marginRight: '30px',
            fontSize: '16px',
            textAlign: 'left',
            alignContent: 'center',
            color: 'black',
            whiteSpace: 'normal',
            overflowWrap: 'break-word'
          }}
          value='No'
          id='btn_contrato'
          className='btn btn-primary boton_contrato'
          onClick={funciones.onClick}
          to='#'
        >
          <br />
          <br />
          <span style={styleContratos} value='No'>
            {'No'}
          </span>
        </Link>
      </div>
    );

    let contenido;

    contenido = (
      <div>
        <img
          id='fondo_principal'
          src='../../img/colsanitas_soft-pag_2.jpg'
          width='748'
          height='1366'
          alt=''
        />
        <p id='nombre_cliente'>{nombre}</p>
        <p id='contrato'>
          SEÑOR USUARIO, USTED CUENTA CON VALES ELECTRÓNICOS VIGENTES EN SU
          OFICINA VIRTUAL.
          <br />
          ¿Desea utilizarlos en esta cita?
        </p>
        {errors.mensaje ? (
          <div id='error_message_contratos' className='alert alert-info'>
            {errors.mensaje}
          </div>
        ) : (
          ''
        )}
        <div className='form-group' id='confirma_vale'>
          {htmlConfirmaUsoVale}
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

    if (cargando) {
      return (
        <div className='principal'>
          <img
            id='fondo_principal'
            src='../../img/colsanitas_soft-pag_2.jpg'
            width='748'
            height='1366'
            alt=''
          />
          <Spinner />
        </div>
      );
    } else {
      return contenido;
    }
  }
}

Vale.propTypes = {
  agregarContrato: PropTypes.func.isRequired,
  reiniciarCompra: PropTypes.func.isRequired,
  setErrors: PropTypes.func.isRequired,
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
  { agregarContrato, reiniciarCompra, setErrors }
)(Vale);
