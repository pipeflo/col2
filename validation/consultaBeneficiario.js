const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateConsultaBeneficiario(data) {
  let errors = {};

  data.numeroIdentificacion = !isEmpty(data.numeroIdentificacion)
    ? data.numeroIdentificacion
    : "";
  data.tipoIdentificacion = !isEmpty(data.tipoIdentificacion)
    ? data.tipoIdentificacion
    : "";

  if (Validator.isEmpty(data.numeroIdentificacion)) {
    errors.numeroIdentificacion = "Se requiere de un número de Identificación.";
  }

  if (Validator.isEmpty(data.tipoIdentificacion)) {
    errors.tipoIdentificacion = "Se requiere del tipo de Identificación.";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
