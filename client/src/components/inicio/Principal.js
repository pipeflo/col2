import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class Inicio extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <Link to='/servicio'>
        <div className='principal'>
          <img
            id='fondo_principal'
            src='../../img/colsanitas_soft-pag_1.jpg'
            width='748'
            height='1366'
            alt=''
          />
        </div>
      </Link>
    );
  }
}

Inicio.propTypes = {
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  errors: state.errors
});

export default connect(
  mapStateToProps,
  {}
)(Inicio);
