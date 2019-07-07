import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
  agregarContrato,
  buscarVales,
  setErrors
} from '../../actions/contratosActions';
import { reiniciarCompra } from '../../actions/identificacionActions';
import Spinner from '../common/Spinner';

class Citas extends Component {
  constructor() {
    super();
    this.state = {
      nombre: '',
      numeroIdentificacion: '',
      tipoIdentificacion: '',
      contratos: [],
      citas: [],
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
    if (this.props.beneficiario.citas.length === 0) {
      this.props.history.push('/identificacion');
    }
    this.setState({
      nombre: this.props.beneficiario.nombre,
      numeroIdentificacion: this.props.beneficiario.numeroIdentificacion,
      tipoIdentificacion: this.props.beneficiario.tipoIdentificacion,
      contratos: this.props.beneficiario.contratos,
      citas: this.props.beneficiario.citas
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

    if (!this.isEmpty(nextProps.beneficiario.vale)) {
      //si no está vacio confirma que ya se buscó vale, ahora miramos ti tiene o no
      if (nextProps.beneficiario.vale.tiene) {
        //si tiene enviamos a confirmar uso de Vale
        this.props.history.push('/vale');
      } else {
        //no tiene, enviamos a pantalla de compra
        this.props.agregarContrato(
          this.props.beneficiario.contratos[0],
          this.props.beneficiario
        );
      }
    }

    if (nextProps.compra.inicioCompra) {
      this.props.history.push('/compra');
    }

    if (nextProps.beneficiario.contratos.length === 0) {
      this.props.history.push('/');
    }

    if (nextProps.compra.valorVale) {
      this.props.history.push('/cantidad');
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
    if (e.target.getAttribute('value') === 'SALIR') {
      this.props.reiniciarCompra({});
    } else {
      const indexCita = e.target.getAttribute('value')
        ? e.target.getAttribute('value')
        : e.target.parentNode.getAttribute('value');
      const d = new Date();
      //const h = d.getHours();
      //const m = d.getMinutes();
      const h = 9; //Pruebas
      const m = 50; //Pruebas
      const difEnMinutos =
        (this.props.beneficiario.citas[indexCita].horaDeLaCita - h) * 60 +
        (this.props.beneficiario.citas[indexCita].minutoDeLaCita - m);
      //hay una hora de diferencia
      if (difEnMinutos >= -10 && difEnMinutos <= 30) {
        //Esta en tiempo, revisamos si tiene algún error de especialidad
        //if (!this.props.beneficiario.citas[indexCita].error) {
        //Cita en tiempo, verificamos si el contrato da error
        //if (!this.props.beneficiario.contratos[0].error) {
        //Cita en tiempo y de pago, pasamos a pagar
        this.props.buscarVales(this.props.beneficiario, indexCita);
        /*} else {
            //el contrato del usuario no require pago
            const errors = {
              mensaje: this.props.beneficiario.contratos[0].error
            };
            this.props.setErrors(errors);
          }
        } else {
          //cita con especialidad
          const errors = {
            mensaje: this.props.beneficiario.citas[indexCita].error
          };
          this.props.setErrors(errors);
        }*/
      } else {
        const errors = {};
        if (difEnMinutos < -10) {
          errors.mensaje = 'Señor Usuario, su cita se encuentra vencida!';
        } else {
          errors.mensaje =
            'Señor Usuario, su cita no puede ser confirmada aún, por favor regrese en ' +
            (difEnMinutos - 30) +
            ' minutos.';
        }
        this.props.setErrors(errors);
      }
    }
  }

  render() {
    const { cargando } = this.props.compra;
    const { nombre, errors } = this.state;
    const funciones = { onClick: this.onClick };
    const styleContratos = { fontWeight: 'bold' };
    let htmlContratos = this.props.beneficiario.citas.map(function(cita, i) {
      return (
        <Link
          key={i}
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
          value={i}
          id='btn_contrato'
          className='btn btn-primary boton_contrato'
          onClick={funciones.onClick}
          to='#'
        >
          <br />
          <br />
          <span style={styleContratos} value={i}>
            Especialidad:{' '}
          </span>{' '}
          <span style={{ color: 'blue' }} value={i}>
            {cita.descripcionDeLaEspecialidad}
          </span>
          <br />
          <span style={styleContratos}>Hora:</span> {cita.horaDeLaCita}:
          {cita.minutoDeLaCita}
          <br />
          <span style={styleContratos}>Médico:</span>{' '}
          {cita.nombreCompletoDelMedico}
          <br />
        </Link>
      );
    });

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
          Usted tiene las siguientes citas asignadas el día de hoy
        </p>
        {errors.mensaje ? (
          <div id='error_message_contratos' className='alert alert-info'>
            {errors.mensaje}
          </div>
        ) : (
          ''
        )}
        <div className='form-group' id='contract_1'>
          {htmlContratos}
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

Citas.propTypes = {
  agregarContrato: PropTypes.func.isRequired,
  reiniciarCompra: PropTypes.func.isRequired,
  buscarVales: PropTypes.func.isRequired,
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
  { agregarContrato, buscarVales, reiniciarCompra, setErrors }
)(Citas);
