const express = require("express");
const fs = require("fs");
const router = express.Router();

//Beneficiario validator
const validateConfiguracion = require("../../validation/validateConfiguracion");

// @Route  GET api/configuracion/test
// @Desc   Test configuracion route
// @Access Public
router.get("/test", (req, res) => res.json({ msg: "Configuracion Funciona" }));

// @Route  GET api/configuracion
// @Desc   Get current configuration
// @Access Public
router.get("/", (req, res) => {
  fs.readFile("./TCP-IP/resource/tcpIp.ini", "utf8", (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      console.log(data);
      res.json({ tcpIpIni: data });
    }
  });
});

// @Route  POST api/beneficiarios/consulta
// @Desc   Consultar un beneficiario
// @Access Public
router.post("/configuracion", (req, res) => {
  const { errors, isValid } = validateConfiguracion(req.body);

  // Check Validation
  if (!isValid) {
    //Error en informacion enviada, enviar respuesta
    return res.status(400).json(errors);
  } else {
    //guardar archivos de configuración
  }
});

module.exports = router;
