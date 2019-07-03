const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateConsultaPrecio(data) {
  let errors = {};

  data.beneficiario.numeroIdentificacion = !isEmpty(
    data.beneficiario.numeroIdentificacion
  )
    ? data.beneficiario.numeroIdentificacion
    : "";
  data.beneficiario.tipoIdentificacion = !isEmpty(
    data.beneficiario.tipoIdentificacion
  )
    ? data.beneficiario.tipoIdentificacion
    : "";

  if (Validator.isEmpty(data.beneficiario.numeroIdentificacion)) {
    errors.numeroIdentificacion = "Se requiere de un número de Identificación";
  }

  if (Validator.isEmpty(data.beneficiario.tipoIdentificacion)) {
    errors.tipoIdentificacion = "Se requiere del tipo de Identificación";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
