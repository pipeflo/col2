const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = {
  validateConsultaContrato: function(contratoData) {
    let errors = {};

    contratoData.codigoCompania = !isEmpty(contratoData.codigoCompania)
      ? contratoData.codigoCompania
      : "";

    contratoData.codigoPlan = !isEmpty(contratoData.codigoPlan)
      ? contratoData.codigoPlan
      : "";

    contratoData.numeroContrato = !isEmpty(contratoData.numeroContrato)
      ? contratoData.numeroContrato
      : "";

    contratoData.numeroFamilia = !isEmpty(contratoData.numeroFamilia)
      ? contratoData.numeroFamilia
      : "";

    return {
      errors,
      isValid: isEmpty(errors)
    };
  }
};
