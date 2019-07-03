const express = require("express");
const soapRequest = require("easy-soap-request");
const fs = require("fs");
const router = express.Router();
const xmlreader = require("xmlreader");
const {
  consultaPrecio,
  registrarCompra,
  dominioWebService
} = require("../../config/keys");

//Beneficiario validator
const validateConsultaBeneficiario = require("../../validation/consultaBeneficiario");
const validateConsultaPrecio = require("../../validation/validateConsultaPrecio");

// @Route  GET api/beneficiarios/test
// @Desc   Test Users route
// @Access Public
router.get("/test", (req, res) =>
  res.json({ msg: "Tipos Identificacion Funciona" })
);

// @Route  GET api/tiposIdentificacion
// @Desc   Traer los tipos de identificación configurados por Colsanitas
// @Access Public
router.get("/", (req, res) => {
  let errors = {};
  //Ir y consultar usuario
  const url =
    "https://" +
    dominioWebService +
    ".colsanitas.com/services/ProxyParametricas.ProxyParametricasHttpSoap11Endpoint";
  const headers = {
    "user-agent": "sampleTest",
    "Content-Type": "text/xml;charset=UTF-8",
    soapAction: "http://www.colsanitas.com/Parametricas/consultar"
  };

  //const xml = fs.readFileSync("test/zipCodeEnvelope.xml", "utf-8");
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:par="http://colsanitas.com/ParametricasServicio/" xmlns:nof="http://colsanitas.com/osi/comun/nofuncionales" xmlns:srv="http://colsanitas.com/osi/srv">
  <soapenv:Header>
     <par:HeaderRqust>
        <par:header>
        </par:header>
     </par:HeaderRqust>
  </soapenv:Header>
  <soapenv:Body>
     <par:ConsultarEnt>
        <par:consultarEnt>
           <srv:Consultar>
              <srv:codigoTabla>68</srv:codigoTabla>
              <srv:nombreTabla>TipoIdentificacion</srv:nombreTabla>
           </srv:Consultar>
        </par:consultarEnt>
     </par:ConsultarEnt>
  </soapenv:Body>
</soapenv:Envelope>`;

  (async () => {
    try {
      const { response } = await soapRequest(url, headers, xml, 10000); // Optional timeout parameter(milliseconds)
      const { body, statusCode } = response;

      xmlreader.read(body, function(err, respuesta) {
        if (err) {
          console.log("Error reading XML:", err);
          errors.server = err;
          errors.server.mensaje =
            "Se presentó un problema al leer la respuesta del servicio de Parametricas (TipoIdentificación) de Colsanitas";
          return res.statusCode(500).json(errors);
        }

        if (
          respuesta["s:Envelope"]["s:Header"][
            "h:HeaderRspns"
          ].header.responseStatus.businessException.errorDetails.errorCode.text() ===
          "OK"
        ) {
          const tiposIdentificacion = [];
          respuesta["s:Envelope"][
            "s:Body"
          ].ConsultarSal.consultarSal.parametricas.each(
            (i, tipoIdentificacionXML) => {
              if (
                !["4", "10", "11", "12"].includes(
                  tipoIdentificacionXML.codigo.text()
                )
              ) {
                const tipoIdentificacion = {
                  codTipoIdentificacion: tipoIdentificacionXML.codigo.text(),
                  tipoIdentificacion: tipoIdentificacionXML.codigoLegal.text(),
                  nombre: tipoIdentificacionXML.nombre.text(),
                  descripcion: tipoIdentificacionXML.descripcion.text()
                };
                tiposIdentificacion.push(tipoIdentificacion);
              }
            }
          );
          return res.json(tiposIdentificacion);
        } else {
          errors.mensaje = respuesta["s:Envelope"]["s:Header"][
            "h:HeaderRspns"
          ].header.responseStatus.businessException.errorDetails.errorDesc.text();
          return res.status(400).json(errors);
        }
      });
    } catch (e) {
      errors.mensaje =
        "No hay conexión con los servicios de Colsanitas, por favor intente de nuevo en unos minutos.";
      return res.status(400).json(errors);
    }
  })();
});

module.exports = router;
