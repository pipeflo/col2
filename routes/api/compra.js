const express = require("express");
const fs = require("fs");
const router = express.Router();
const {
  registrarCompra,
  numeroTerminal,
  dominioWebService
} = require("../../config/keys");
const soapRequest = require("easy-soap-request");
const soap = require("soap");

//Beneficiario validator
const validateCompra = require("../../validation/validationCompra");

// @Route  GET api/users/test
// @Desc   Test Users route
// @Access Public
router.get("/test", (req, res) => res.json({ msg: "Compras Funciona" }));

// @Route  POST api/compra/iniciar
// @Desc   Consultar un beneficiario
// @Access Public
router.post("/iniciar", (req, res) => {
  console.log("Entro a iniciar compra con ", req.body);
  const { errors, isValid } = validateCompra(req.body);

  //borrar archivo
  fs.unlink("./TCP-IP/IOFile/out/dataf001_OUT.eft", err => {
    if (err) {
      console.log("Error borrando archivo", err);
    }
  });

  // Check Validation
  if (!isValid) {
    console.log(errors);
    return res.status(400).json(errors);
  }

  //Consultar precio Vale
  // stringComra= "idTransaccion,valorTotal,iva,base,númeroCaja,númeroTerminal,idTransaccion,codigounico,propinaOCashBack,iac,idCajero,LRC"
  console.log("req.body", req.body);
  const stringCompra = `01,${req.body.valorTotal},0,0,KIOSKO_602,${
    req.body.codigoCompania === "10" ? "000A7UC5" : "000A7UDV"
  },${req.body.idTransaccion},${
    req.body.codigoCompania === "10" ? "010107308" : "010811792"
  },0,0,dataf001,`;
  const lrc = calculateLRC(stringCompra);
  /*const stringCompra = `01,${
    req.body.valorTotal
  },0,0,KIOSKO_602,${numeroTerminal},${req.body.idTransaccion},${
    req.body.codigoCompania === "10" ? "010107308" : "010811792"
  },0,0,dataf001,`;
  const lrc = calculateLRC(stringCompra);*/
  const stringCompraFinal = stringCompra + lrc;
  //const stringCompra = `01,50,1,T0501,78175,0,0,11,59`;

  fs.writeFile(
    "./TCP-IP/IOFile/inp/dataf001_inp.eft",
    stringCompraFinal,
    { flag: "w" },
    function(err) {
      if (err) {
        console.log(err);
        return res.status(400).json(errors);
      }
      console.log("Escribio archivo");
      return res.json({
        inicioCompra: true,
        valorTotal: req.body.valorTotal,
        precioVale: req.body.valorVale,
        cantidad: Number(req.body.cantidad),
        stringCompra: stringCompraFinal,
        idTransaccion: req.body.idTransaccion
      });
    }
  );
});

// @Route  POST api/compra/registrar
// @Desc   Registrar compra
// @Access Public
router.post("/registrar", (req, res) => {
  //const { errors, isValid } = validateConsultaPrecio(req.body);

  const errors = {};

  console.log("ingreso a registrar compra:", req.body);

  const isValid = true;

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  } else {
    //Ir y consultar usuario
    getTransactionId(function(errGettingId, idTransaccion) {
      const url =
        "https://" +
        dominioWebService +
        ".colsanitas.com/services/ValeElectronico.ValeElectronicoHttpSoap12Endpoint?wsdl";

      const input = {
        canal: registrarCompra.canal,
        ciudad: req.body.compra.contrato.ciudad.codigo,
        codigoCompania: req.body.compra.contrato.codigoCompania,
        codigoConcepto: registrarCompra.codigoConcepto,
        codigoEstacion: registrarCompra.codigoEstacion,
        tipoDocUsuario: req.body.beneficiario.codTipoIdentificacion,
        documentoIdentUsu: req.body.beneficiario.numeroIdentificacion,
        contrato: req.body.compra.contrato.numeroContrato,
        plan: req.body.compra.contrato.codigoPlan,
        familia: req.body.compra.contrato.numeroFamilia,
        usuario: req.body.compra.contrato.codigoTipoUsuario,
        numerTransaccion: idTransaccion,
        cantidad: req.body.compra.cantidad,
        valorTotalTrx: req.body.compra.valorTotal,
        mediosDePago: `5,${req.body.compra.valorTotal},0,0,D,0,${
          //req.body.compra.numeroAprobacion.replace(/\D/g,'')
          "tsg56378ksj27j8sjs8".replace(/\D/g, "")
        }`,
        vales: req.body.compra.cantidad,
        categoria: "",
        documentoIdentPrest: "",
        servicio: "",
        viaIngreso: "",
        estado: "2",
        tipoDocPrest: ""
      };

      console.log("INPUT:::", input);

      soap.createClient(url, function(err, client) {
        client.registrar(input, function(err, result) {
          if (err) {
            errors.mensaje =
              "No ha sido posible registrar la compra del Vale con Colsanitas, por favor comuníquese a la línea 4871920 o diríjase al jefe de servicios para validar su(s) vale(s).";
            return res.status(400).json(errors);
          } else {
            console.log(result);
            if (result) {
              if (result.ValeElectronico[0].codigoError != "0") {
                errors.mensaje = result.ValeElectronico[0].descripcionError;
                return res.status(400).json(errors);
              } else {
                setTransactionId(idTransaccion);
                req.body.compra.transaccion =
                  result.ValeElectronico[0].transaccion;
                req.body.compra.valeElectronico = result.ValeElectronico;
                return res.json(req.body);
              }
            } else {
              errors.mensaje =
                "No ha sido posible registrar la compra del Vale con Colsanitas, por favor comuníquese a la línea 4871920 o diríjase al jefe de servicios para validar su(s) vale(s).";
              return res.status(400).json(errors);
            }
          }
        });
      });
    });
  }
});

// @Route  POST api/compra/tiraAuditoria
// @Desc   Traer tira de auditoria para imprimir
// @Access Public
router.post("/tiraAuditoria", (req, res) => {
  const errors = {};

  console.log("ingreso a tiraAuditoria:", req.body);

  const isValid = true;

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  } else {
    //Ir y consultar usuario
    const url =
      "https://" +
      dominioWebService +
      ".colsanitas.com/services/GestionDocumentoEquivalente.GestionDocumentoEquivalenteHttpSoap12Endpoint?wsdl";

    const input = {
      codigo_compania: req.body.contrato.codigoCompania,
      estacion: registrarCompra.codigoEstacion,
      num_transaccion_docEquiv: req.body.transaccion
    };

    console.log("Input:", input);

    soap.createClient(url, function(err, client) {
      if (err) {
        errors.mensaje =
          "No ha sido posible generar el Documento Equivalente, por favor comuníquese a la línea 4871920 o diríjase al jefe de servicios para validar su(s) vale(s).";
        console.log("Error genrando cliente SOAP Traer Tira:", err);
        return res.status(400).json(errors);
      } else {
        client.ConsultarTiraAuditora(input, function(err, result) {
          if (err) {
            errors.mensaje =
              "No ha sido posible generar el Documento Equivalente, por favor comuníquese a la línea 4871920 o diríjase al jefe de servicios para validar su(s) vale(s).";
            console.log("Error llamando Servicio TraerTira:", err);
            return res.status(400).json(errors);
          } else {
            result.tira_auditora.textoHtml = result.tira_auditora.texto_tiraAudit.replace(
              /\n/g,
              "<br />"
            );

            console.log(result);

            req.body.tiraAuditora = result.tira_auditora;
            return res.json(req.body);
          }
        });
      }
    });
  }
});

const calculateLRC = str => {
  var bytes = [];
  var lrc = 0;
  for (var i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  for (var i = 0; i < str.length; i++) {
    lrc ^= bytes[i];
  }
  //return String.fromCharCode(lrc);
  return lrc.toString(16);
};

const getTransactionId = callback => {
  fs.readFile("./config/idTransaccion.txt", "utf8", function(err, contents) {
    if (!err) {
      if (contents) {
        console.log(contents);
        contents = parseInt(contents, 10);
        console.log("idTransaccion::::::", contents + 1);
        callback(null, contents + 1);
      }
    } else {
      callback("No ha sido posible obtener el Id de la Transacción", null);
    }
  });
};

const setTransactionId = idTransaccion => {
  fs.writeFile("./config/idTransaccion.txt", idTransaccion, function(err) {
    if (err) {
      console.log("Error al guardar el ID De la Transacción");
      return "No ha sido posible guardar el Id de la Transacción";
    } else {
      console.log("Escribio idTransaccion:", idTransaccion);
    }
  });
};

module.exports = router;
