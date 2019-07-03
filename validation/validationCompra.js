const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateCompra(data) {
  let errors = {};

  data.cantidad = !isEmpty(data.cantidad) ? data.cantidad : "";

  if (Validator.isEmpty(data.cantidad.toString())) {
    errors.cantidad = "La cantidad de Vales debe ser mayor a 0";
  }

  if (data.cantidad > 25 || data.cantidad < 1) {
    errors.cantidad = "Debe digitar una cantidad válida entre 1 y 25 vales.";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
