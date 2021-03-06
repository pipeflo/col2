import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { traerAccessToken } from '../../actions/servicioActions';
import Spinner from '../common/Spinner';

class Servicio extends Component {
  constructor() {
    super();
    this.state = {};
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    if (this.props.app.access_token === '') {
      this.props.traerAccessToken();
    }
  }

  onClick(e) {
    e.preventDefault();

    const codTipoIdentificacion = e.target.getAttribute('value');

    this.props.asignarTipoIdentificacion(
      this.props.tiposIdentificacion.tipos[codTipoIdentificacion]
    );
  }

  render() {
    const { cargando } = this.props.app;
    const { errors } = this.props;
    let contenido;
    let htmlTiposIdentificacion;
    if (errors.mensaje) {
      htmlTiposIdentificacion = (
        <div id='error_message_inicio' className='alert alert-info'>
          {errors.mensaje}
        </div>
      );
    } else {
      htmlTiposIdentificacion = (
        <div>
          <Link
            key='1'
            style={{
              width: '200px',
              height: '200px',
              marginBottom: '80px',
              marginRight: '80px',
              fontSize: '22px',
              alignContent: 'center',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              paddingTop: '8%'
            }}
            value='1hola'
            id='btn_primario'
            className='btn btn-primary'
            to='/inicioCli'
          >
            {' '}
            CITA - PAGO CON TARJETA O VALE ELECTRÓNICO
          </Link>

          <Link
            key='2'
            style={{
              width: '200px',
              height: '200px',
              marginBottom: '80px',
              marginRight: '80px',
              fontSize: '22px',
              alignContent: 'center',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              paddingTop: '8%'
            }}
            value='1hola'
            id='btn_primario'
            className='btn btn-primary'
            to='/ventanilla'
          >
            {' '}
            CITA - PAGO EN EFECTIVO
          </Link>

          <Link
            key='3'
            style={{
              width: '200px',
              height: '200px',
              marginBottom: '80px',
              marginRight: '80px',
              fontSize: '22px',
              alignContent: 'center',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              paddingTop: '8%'
            }}
            value='1hola'
            id='btn_primario'
            className='btn btn-primary'
            to='/ventanilla'
          >
            {' '}
            INFORMACIÓN GENERAL
          </Link>

          <Link
            key='4'
            style={{
              width: '200px',
              height: '200px',
              marginBottom: '80px',
              marginRight: '80px',
              fontSize: '22px',
              alignContent: 'center',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              paddingTop: '8%'
            }}
            value='1hola'
            id='btn_primario'
            className='btn btn-primary'
            to='/inicio'
          >
            {'COMPRA DE VALES'}
          </Link>
        </div>
      );
    }

    if (cargando) {
      contenido = (
        <div className='principal'>
          <Spinner />
        </div>
      );
    } else {
      contenido = (
        <div className='principal'>
          <img
            id='fondo_principal'
            src='../../img/fondo_principal_3.jpg'
            width='748'
            height='1366'
            alt=''
          />
          <p id='select_tipo_trx'>POR FAVOR SELECCIONE UNA OPCIÓN</p>
          <div className='form-group' id='tipos_transaccion'>
            {htmlTiposIdentificacion}
          </div>
        </div>
      );
    }
    return contenido;
  }
}

Servicio.propTypes = {
  traerAccessToken: PropTypes.func.isRequired,
  app: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  app: state.app,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { traerAccessToken }
)(Servicio);
