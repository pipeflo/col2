import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reiniciarCompra } from '../../actions/identificacionActions';

class Ventanilla extends Component {
  constructor() {
    super();
    this.state = {
      timeOut: null
    };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    const props = this.props;
    let tiempo = setTimeout(function() {
      props.reiniciarCompra({});
    }, 10000);
    this.timeOut = tiempo;
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.app.access_token) {
      this.props.history.push('/');
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
    return (
      <div className='principal'>
        <img
          id='fondo_principal'
          src='../../img/colsanitas_soft-pag_2.jpg'
          width='748'
          height='1366'
          alt=''
        />
        <p id='nombre_cliente'>Dirijase a ventanilla</p>
        <div className='form-group' id='tipos_identificacion'>
          <div id='error_message_inicio' className='alert alert-info'>
            Por favor diríjase a Ventanilla
          </div>
        </div>
      </div>
    );
  }
}

Ventanilla.propTypes = {
  reiniciarCompra: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  app: state.app,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { reiniciarCompra }
)(Ventanilla);
