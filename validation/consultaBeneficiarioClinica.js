const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateConsultaBeneficiarioClinica(data) {
  let errors = {};

  data.numeroIdentificacion = !isEmpty(data.numeroIdentificacion)
    ? data.numeroIdentificacion
    : '';
  data.codTipoIdentificacion = !isEmpty(data.codTipoIdentificacion)
    ? data.codTipoIdentificacion
    : '';

  data.access_token = !isEmpty(data.access_token) ? data.access_token : '';

  if (Validator.isEmpty(data.numeroIdentificacion)) {
    errors.numeroIdentificacion = 'Se requiere de un número de Identificación.';
  }

  if (Validator.isEmpty(data.codTipoIdentificacion)) {
    errors.codTipoIdentificacion = 'Se requiere del tipo de Identificación.';
  }

  if (Validator.isEmpty(data.access_token)) {
    errors.access_token =
      'Se requiere del access token para el llamado del API.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
