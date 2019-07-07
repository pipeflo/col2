const express = require('express');
const soapRequest = require('easy-soap-request');
const fs = require('fs');
const router = express.Router();
const xmlreader = require('xmlreader');
const axios = require('axios');
const {
  consultaPrecio,
  contratosEspeciales,
  planesExcluidos,
  dominioWebService,
  especialidadesSinPapeleo,
  planesSinPago
} = require('../../config/keys');

//Beneficiario validator
const validateConsultaBeneficiarioClinica = require('../../validation/consultaBeneficiarioClinica');
const validateConsultaBeneficiario = require('../../validation/consultaBeneficiario');
const validateConsultaPrecio = require('../../validation/validateConsultaPrecio');
const {
  validateConsultaContrato
} = require('../../validation/validateConsultas');

// @Route  GET api/beneficiarios/test
// @Desc   Test Users route
// @Access Public
router.get('/test', (req, res) => res.json({ msg: 'Beneficiarios Funciona' }));

// @Route  POST api/beneficiarios/consulta
// @Desc   Consultar un beneficiario
// @Access Public
router.post('/consulta', (req, res) => {
  const { errors, isValid } = validateConsultaBeneficiario(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  } else {
    //Ir y consultar usuario
    const url =
      'https://' +
      dominioWebService +
      '.colsanitas.com/services/ProxyContratoMP.ProxyContratoMPHttpSoap12Endpoint';
    const headers = {
      'user-agent': 'sampleTest',
      'Content-Type': 'text/xml;charset=UTF-8',
      soapAction: 'http://www.colsanitas.com/ContratoMP/consultarBeneficiario'
    };

    //const xml = fs.readFileSync("test/zipCodeEnvelope.xml", "utf-8");
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="http://colsanitas.com/ContratoMPServicio/" xmlns:nof="http://colsanitas.com/osi/comun/nofuncionales" xmlns:srv="http://colsanitas.com/osi/srv" xmlns:per="http://colsanitas.com/osi/comun/persona">
  <soapenv:Header>
     <con:HeaderRqust>
        <!--Optional:-->
        <con:header>
           <!--Optional:-->
           <nof:messageHeader>
              <!--Optional:-->
              <nof:messageKey>
              </nof:messageKey>
              <!--Optional:-->
              <nof:messageInfo>
                 <!--Optional:-->
                 <nof:tipoConsulta>1</nof:tipoConsulta>
              </nof:messageInfo>
              <!--Optional:-->
              <nof:trace>
              </nof:trace>
           </nof:messageHeader>
           <!--Optional:-->
           <nof:user>           
           </nof:user>
        </con:header>
     </con:HeaderRqust>
  </soapenv:Header>
  <soapenv:Body>
     <con:ConsultarBeneficiarioEnt>
        <!--Optional:-->
        <con:consultarBeneficiarioEnt>
           <!--Optional:-->
           <srv:ConsultarBeneficiario>
              <srv:identificacionBeneficiario>
                 <!--Optional:-->
                 <per:numIdentificacion>${
                   req.body.numeroIdentificacion
                 }</per:numIdentificacion>
                 <!--Optional:-->
                 <per:tipoIdentificacion>${
                   req.body.tipoIdentificacion
                 }</per:tipoIdentificacion>
              </srv:identificacionBeneficiario>
           </srv:ConsultarBeneficiario>
        </con:consultarBeneficiarioEnt>
     </con:ConsultarBeneficiarioEnt>
  </soapenv:Body>
  </soapenv:Envelope>`;

    (async () => {
      try {
        const { response } = await soapRequest(url, headers, xml, 10000); // Optional timeout parameter(milliseconds)
        const { body, statusCode } = response;

        xmlreader.read(body, function(err, respuesta) {
          if (err) return console.log('Error reading XML:', err);

          if (
            respuesta['s:Envelope']['s:Header'][
              'h:HeaderRspns'
            ].header.responseStatus.businessException.errorDetails.errorCode.text() ===
            'OK'
          ) {
            //encontró beneficiario
            let beneficiario = {
              tipoIdentificacion: req.body.tipoIdentificacion,
              numeroIdentificacion: req.body.numeroIdentificacion,
              codTipoIdentificacion: req.body.codTipoIdentificacion
            };
            if (
              respuesta['s:Envelope'][
                's:Body'
              ].ConsultarBeneficiarioSal.consultarBeneficiarioSal.Contrato.count() ===
              1
            ) {
              //Tiene un solo contrato

              beneficiario.nombre = respuesta['s:Envelope'][
                's:Body'
              ].ConsultarBeneficiarioSal.consultarBeneficiarioSal.Contrato.InformacionBeneficiarios.nombreBeneficiario
                .text()
                .replace(/_|,/g, function(x) {
                  return x === '_' ? ' ' : ', ';
                });
              beneficiario.tipoUsuario = respuesta['s:Envelope'][
                's:Body'
              ].ConsultarBeneficiarioSal.consultarBeneficiarioSal.Contrato.InformacionBeneficiarios.tipoUsuario.text();
            } else if (
              respuesta['s:Envelope'][
                's:Body'
              ].ConsultarBeneficiarioSal.consultarBeneficiarioSal.Contrato.count() >
              1
            ) {
              //Tiene varios contratos
              beneficiario.nombre = respuesta['s:Envelope'][
                's:Body'
              ].ConsultarBeneficiarioSal.consultarBeneficiarioSal.Contrato.at(0)
                .InformacionBeneficiarios.nombreBeneficiario.text()
                .replace(/_|,/g, function(x) {
                  return x === '_' ? ' ' : ', ';
                });
              beneficiario.tipoUsuario = respuesta['s:Envelope'][
                's:Body'
              ].ConsultarBeneficiarioSal.consultarBeneficiarioSal.Contrato.at(
                0
              ).InformacionBeneficiarios.tipoUsuario.text();
            }
            beneficiario.contratos = extraerContratos(
              respuesta['s:Envelope']['s:Body'].ConsultarBeneficiarioSal
                .consultarBeneficiarioSal.Contrato
            );
            //Extrajo datos principales del Beneficiario

            if (beneficiario.tipoUsuario !== 'TITULAR') {
              //El usuario es Beneficario, enviamos respuesta con contratos
              return res.json(beneficiario);
            } else {
              //Buscamos si tiene más contratos
              consultarTitular(beneficiario, errors, function(beneficiario) {
                console.log('Retorono nuevo beneficiario:', beneficiario);
                return res.json(beneficiario);
              });
            }
          } else {
            console.log(
              'ErroCode:',
              respuesta['s:Envelope']['s:Header'][
                'h:HeaderRspns'
              ].header.responseStatus.businessException.errorDetails.errorCode.text()
            );
            if (
              (errors.mensaje =
                respuesta['s:Envelope']['s:Header'][
                  'h:HeaderRspns'
                ].header.responseStatus.businessException.errorDetails.errorCode.text() ===
                'Con01')
            ) {
              errors.mensaje = `No se encontró una persona con ${
                req.body.tipoIdentificacionNombre
              } número ${
                req.body.numeroIdentificacion
              }. Por favor verifique la información ingresada.`;
              return res.status(400).json(errors);
            } else {
              errors.mensaje = respuesta['s:Envelope']['s:Header'][
                'h:HeaderRspns'
              ].header.responseStatus.businessException.errorDetails.errorDesc.text();
              return res.status(400).json(errors);
            }
          }
        });
      } catch (e) {
        errors.mensaje =
          'No hay conexión con los servicios de Colsanitas, por favor intente de nuevo en unos minutos.';
        return res.status(400).json(errors);
      }
    })();
  }
});

// @Route  GET api/beneficiarios/consultaClinica
// @Desc   Consultar datos usuario clínica
// @Access Public
router.post('/consultaClinica', (req, res) => {
  const { errors, isValid } = validateConsultaBeneficiarioClinica(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  } else {
    const config = {
      headers: {
        Authorization: 'Bearer ' + req.body.access_token
      }
    };
    axios
      .get(
        `https://papi.colsanitas.com/osi/api/afiliados/v1.0.0/validacionderechos/tipdoc/${
          req.body.codTipoIdentificacion
        }/numdoc/${req.body.numeroIdentificacion}`,
        config
      )
      .then(function(response) {
        if (response.data.consultarPorIdentificacion.return.errCode == 0) {
          console.log('Encontró usuario:', response.data);
          //const userData = JSON.parse(response.data);
          const user = response.data.consultarPorIdentificacion.return.datosContratosDTO.find(
            function(contrato) {
              return (
                ['20', '10'].includes(contrato.codCia) &&
                contrato.datosUsuariosDTO[0].desEstado === 'HABILITADO'
              );
            }
          );
          if (user) {
            let beneficiario = {
              nombre: user.datosUsuariosDTO[0].nombre.replace(/_|,/g, function(
                x
              ) {
                return x === '_' ? ' ' : ', ';
              }),
              tipoIdentificacion: req.body.tipoIdentificacion,
              codTipoIdentificacion: req.body.codTipoIdentificacion,
              tipoIdentificacionNombre: user.datosUsuariosDTO[0].desTipoDoc,
              numeroIdentificacion: req.body.numeroIdentificacion,
              contratos: [
                {
                  nombreProducto: user.descCia,
                  numeroContrato: user.contUsr,
                  estadoContrato: '',
                  estadoUsuario: user.datosUsuariosDTO[0].desEstado,
                  tipoUsuario: user.datosUsuariosDTO[0].descParent,
                  codigoTipoUsuario: user.datosUsuariosDTO[0].numUsr,
                  codigoCompania: user.codCia,
                  nombreCompania: user.descCia,
                  codigoPlan: user.codPlan,
                  nombrePlan: user.descPlan,
                  numeroFamilia: user.famUsr,
                  estadoTitularFamilia: 'LIQUIDADO',
                  fechaPrestacionDeServicio: new Date(),
                  fechaFinVigencia: '',
                  error: false
                }
              ],
              citas: []
            };
            //validar estado contrato codigo compania 10 y codigo plan 55, 56 o 67
            if (
              planesSinPago.includes(beneficiario.contratos[0].codigoPlan) &&
              beneficiario.contratos[0].codigoCompania === '10'
            ) {
              beneficiario.contratos[0].error =
                'Señor Usuario, su contrato no requiere de un pago en esta cede, cualquier duda por favor diríjase a Ventanilla.';
            }
            //agregar citas
            try {
              consultarCitasPromise(beneficiario)
                .then(beneficiario => {
                  if (beneficiario.citas.length == 0) {
                    errors.mensaje =
                      'El usuario no tiene citas el día de hoy. Cualquier duda por favor acerquese a ventanilla.';
                    return res.status(400).json(errors);
                  } else {
                    beneficiario.citas.forEach(cita => {
                      if (
                        especialidadesSinPapeleo.includes(
                          cita.codigoDeLaEspecialidad
                        )
                      ) {
                        cita.error =
                          'Su cita es de acceso directo, por favor diríjase a la sala de espera.';
                      } else {
                        cita.error = false;
                      }
                    });
                    return res.json(beneficiario);
                  }
                })
                .catch(errorGettingCitas => {
                  return res.status(400).json(errorGettingCitas);
                });
            } catch (err) {
              console.log(err);
              errors.mensaje = err;
              return res.status(400).json(errors);
            }
          } else {
            //Se encontro usuario pero no tiene contratos vigentes
            errors.mensaje =
              'El Usuario ingresado no cuenta con contratos vigentes.';
            return res.status(400).json(errors);
          }
        } else {
          errors.mensaje = `No se encontró una persona con ${
            req.body.tipoIdentificacionNombre
          } número ${
            req.body.numeroIdentificacion
          }. Por favor verifique la información ingresada.`;
          return res.status(400).json(errors);
        }
      })
      .catch(function(error) {
        errors.mensaje =
          "Error al buscando usuario en 'API Papi': " + error.message;
        return res.status(400).json(errors);
      });
  }
});

// @Route  POST api/beneficiarios/consulta
// @Desc   Consultar un beneficiario
// @Access Public
const consultarTitular = (titular, errors, callback) => {
  //Ir y consultar usuario
  const url =
    'https://' +
    dominioWebService +
    '.colsanitas.com/services/ProxyContratoMP.ProxyContratoMPHttpSoap12Endpoint';
  const headers = {
    'user-agent': 'sampleTest',
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: 'http://www.colsanitas.com/ContratoMP/consultar'
  };
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="http://colsanitas.com/ContratoMPServicio/" xmlns:nof="http://colsanitas.com/osi/comun/nofuncionales" xmlns:srv="http://colsanitas.com/osi/srv" xmlns:per="http://colsanitas.com/osi/comun/persona">
<soapenv:Header>
   <con:HeaderRqust>
      <con:header>
         <nof:messageHeader>
            <nof:messageInfo>
               <nof:tipoConsulta>1</nof:tipoConsulta>
            </nof:messageInfo>
         </nof:messageHeader>
      </con:header>
   </con:HeaderRqust>
</soapenv:Header>
<soapenv:Body>
   <con:ConsultarEnt>
      <con:consultarEnt>
         <srv:Consultar>
            <srv:IdentificacionContratanteTitFamilia>
               <per:numIdentificacion>${
                 titular.numeroIdentificacion
               }</per:numIdentificacion>
               <per:tipoIdentificacion>${
                 titular.tipoIdentificacion
               }</per:tipoIdentificacion>
            </srv:IdentificacionContratanteTitFamilia>
         </srv:Consultar>
      </con:consultarEnt>
   </con:ConsultarEnt>
</soapenv:Body>
</soapenv:Envelope>`;

  (async () => {
    try {
      const { response } = await soapRequest(url, headers, xml, 10000); // Optional timeout parameter(milliseconds)
      const { body, statusCode } = response;
      xmlreader.read(body, function(err, respuesta) {
        if (err) return console.log('Error reading XML:', err);

        if (
          respuesta['s:Envelope']['s:Header'][
            'h:HeaderRspns'
          ].header.responseStatus.businessException.errorDetails.errorCode.text() ===
          'OK'
        ) {
          //encontró beneficiario
          if (
            respuesta['s:Envelope'][
              's:Body'
            ].ConsultarSal.consultarSal.contratosMP.count() <=
            titular.contratos.length
          ) {
            //Tiene el mismo o menor número de contratos encontrados
            callback(titular);
          } else {
            //Tiene contratos diferentes, los revisamos para tomar los diferentes
            const numContratos = titular.contratos.map(
              contrato => contrato.numeroContrato
            );
            console.log('Numeros de contratos previos:', numContratos);
            respuesta['s:Envelope'][
              's:Body'
            ].ConsultarSal.consultarSal.contratosMP.each((i, contratoXml) => {
              if (
                !numContratos.includes(contratoXml.Caratula.numContrato.text())
              ) {
                //El contrato es adicional, lo procesamos
                const contrato = {
                  nombreProducto: contratoXml.Caratula.nombreProducto.text(),
                  numeroContrato: contratoXml.Caratula.numContrato.text(),
                  estadoContrato: contratoXml.Caratula.codEstadoContrato.text(),
                  estadoUsuario: contratoXml.TitularFamilia.estadoTitularFamilia.text(),
                  tipoUsuario: 'TITULAR',
                  codigoTipoUsuario: '21',
                  codigoCompania: contratoXml.Caratula.producto.text(),
                  nombreCompania: contratoXml.Caratula.nombreProducto.text(),
                  codigoPlan: contratoXml.Caratula.codigoPlan.text(),
                  nombrePlan: contratoXml.Caratula.nombrePlan.text(),
                  numeroFamilia: contratoXml.TitularFamilia.numeroFamilia.text(),
                  estadoTitularFamilia: contratoXml.TitularFamilia.estadoTitularFamilia.text(),
                  fechaPrestacionDeServicio: new Date(),
                  fechaFinVigencia: new Date(
                    contratoXml.TitularFamilia.fechaFinVigencia.text()
                  )
                };

                if (contratosEspeciales.includes(contrato.numeroContrato)) {
                  contrato.error =
                    'El contrato seleccionado no requiere de la compra de Vales.';
                }

                if (
                  (contrato.codigoCompania != '10' &&
                    contrato.codigoCompania != '20') ||
                  planesExcluidos.includes(contrato.codigoPlan) ||
                  contratosEspeciales.includes(contrato.numeroContrato)
                ) {
                  contrato.error =
                    'El contrato seleccionado no requiere de la compra de Vales.';
                } else {
                  if (contrato.estadoContrato === '4') {
                    contrato.error = false;
                  } else if (contrato.estadoContrato === '1') {
                    var q = new Date();
                    var m = q.getMonth();
                    var d = q.getDate();
                    var y = q.getFullYear();

                    const currentDate = new Date(y, m, d);
                    if (contrato.fechaFinVigencia >= currentDate) {
                      contrato.error = false;
                    } else {
                      contrato.error =
                        'Contrato cancelado, acérquese a Asesoría integral o comuníquese a la Línea Nro. 4871920';
                    }
                  }
                }
                titular.contratos.push(contrato);
              }
            });
          }
          callback(titular);
        } else {
          console.log(
            'Error consultando Titular:',
            respuesta['s:Envelope']['s:Header'][
              'h:HeaderRspns'
            ].header.responseStatus.businessException.errorDetails.errorCode.text()
          );
          callback(titular);
        }
      });
    } catch (e) {
      errors.mensaje =
        'No hay conexión con los servicios de Colsanitas, por favor intente de nuevo en unos minutos.';
      return titular;
    }
  })();
};

// @Route  POST api/beneficiarios/ciudad
// @Desc   Traer código de ciudad de un contrato
// @Access Public
router.post('/ciudad', (req, res) => {
  const { errors, isValid } = validateConsultaContrato(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  } else {
    //Ir y consultar usuario
    const url =
      'https://' +
      dominioWebService +
      '.colsanitas.com/services/ProxyContratoMP.ProxyContratoMPHttpSoap12Endpoint';
    const headers = {
      'user-agent': 'sampleTest',
      'Content-Type': 'text/xml;charset=UTF-8',
      soapAction: 'http://www.colsanitas.com/ContratoMP/consultar'
    };

    //const xml = fs.readFileSync("test/zipCodeEnvelope.xml", "utf-8");
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="http://colsanitas.com/ContratoMPServicio/" xmlns:nof="http://colsanitas.com/osi/comun/nofuncionales" xmlns:srv="http://colsanitas.com/osi/srv" xmlns:per="http://colsanitas.com/osi/comun/persona">
    <soapenv:Header>
       <con:HeaderRqust>
          <con:header>
             <nof:messageHeader>
                <nof:messageInfo>
                   <nof:tipoConsulta>2</nof:tipoConsulta>
                </nof:messageInfo>
             </nof:messageHeader>
          </con:header>
       </con:HeaderRqust>
    </soapenv:Header>
    <soapenv:Body>
       <con:ConsultarEnt>
          <con:consultarEnt>
             <srv:Consultar>
                <srv:producto>${req.body.codigoCompania}</srv:producto>
                <srv:codigoPlan>${req.body.codigoPlan}</srv:codigoPlan>
                <srv:numContrato>${req.body.numeroContrato}</srv:numContrato>
                <srv:numeroFamilia>${req.body.numeroFamilia}</srv:numeroFamilia>
             </srv:Consultar>
          </con:consultarEnt>
       </con:ConsultarEnt>
    </soapenv:Body>
 </soapenv:Envelope>`;

    (async () => {
      try {
        const { response } = await soapRequest(url, headers, xml, 10000); // Optional timeout parameter(milliseconds)
        const { body, statusCode } = response;

        xmlreader.read(body, function(err, respuesta) {
          if (err) return console.log('Error reading XML:', err);

          if (
            respuesta['s:Envelope']['s:Header'][
              'h:HeaderRspns'
            ].header.responseStatus.businessException.errorDetails.errorCode.text() ===
            'OK'
          ) {
            //encontró contrato
            let ciudad = {};

            ciudad.codigo = respuesta['s:Envelope'][
              's:Body'
            ].ConsultarSal.consultarSal.contratosMP.Caratula.direccionContrato.ciudad.codigo.text();

            ciudad.descripcion = respuesta['s:Envelope'][
              's:Body'
            ].ConsultarSal.consultarSal.contratosMP.Caratula.direccionContrato.ciudad.descripcion.text();

            req.body.ciudad = ciudad;
            return res.json(req.body);
          } else {
            errors.mensaje = respuesta['s:Envelope']['s:Header'][
              'h:HeaderRspns'
            ].header.responseStatus.businessException.errorDetails.errorDesc.text();
            return res.status(400).json(errors);
          }
        });
      } catch (e) {
        errors.mensaje =
          'No hay conexión con los servicios de Colsanitas, por favor intente de nuevo en unos minutos.';
        return res.status(400).json(errors);
      }
    })();
  }
});

// @Route  POST api/beneficiarios/precio
// @Desc   Consultar un precio de vale para un beneficiario
// @Access Public
router.post('/precio', (req, res) => {
  const { errors, isValid } = validateConsultaPrecio(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  } else {
    //Ir y consultar usuario
    const url =
      'https://' +
      dominioWebService +
      '.colsanitas.com/services/GestionPines.GestionPinesHttpSoap12Endpoint';
    const headers = {
      'user-agent': 'sampleTest',
      'Content-Type': 'text/xml;charset=UTF-8',
      soapAction: 'http://www.colsanitas.com/GestionPines/ConsultarPrecio'
    };

    //const xml = fs.readFileSync("test/zipCodeEnvelope.xml", "utf-8");
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ges="http://www.colsanitas.com/GestionPines/" xmlns:com="http://www.colsanitas.com/schema/osi/comun" xmlns:srv="http://www.colsanitas.com/schema/osi/srv">
    <soapenv:Header>
       <ges:HeaderRqust>
          <header>
             <com:user>
              <com:userName>${consultaPrecio.userName}</com:userName>
              <com:userToken>${consultaPrecio.userToken}</com:userToken>
             </com:user>
          </header>
       </ges:HeaderRqust>
    </soapenv:Header>
    <soapenv:Body>
       <ges:ConsultaPrecioEnt>
          <precio>
             <srv:consulta>
              <srv:codigoCompania>${
                req.body.contrato.codigoCompania
              }</srv:codigoCompania>
              <srv:codigoPlan>${req.body.contrato.codigoPlan}</srv:codigoPlan>
              <srv:numeroContrato>${
                req.body.contrato.numeroContrato
              }</srv:numeroContrato>
             </srv:consulta>
             <srv:numeroFamilia>${
               req.body.contrato.numeroFamilia
             }</srv:numeroFamilia>
             <srv:documento>
             <com:Documento>${
               req.body.beneficiario.numeroIdentificacion
             }</com:Documento>
            <com:TipoDocumento>${
              req.body.beneficiario.codTipoIdentificacion.length > 1
                ? req.body.beneficiario.codTipoIdentificacion
                : '0' + req.body.beneficiario.codTipoIdentificacion
            }</com:TipoDocumento>
             </srv:documento>
             <srv:codCiudad>${req.body.contrato.ciudad.codigo}</srv:codCiudad>
             <srv:cantidad>1</srv:cantidad>
          </precio>
       </ges:ConsultaPrecioEnt>
    </soapenv:Body>
 </soapenv:Envelope>`;

    (async () => {
      try {
        const { response } = await soapRequest(url, headers, xml, 10000); // Optional timeout parameter(milliseconds)
        const { body, statusCode } = response;

        xmlreader.read(body, function(err, respuesta) {
          if (err) return console.log('Error reading XML:', err);
          console.log(
            'precio vale:',
            respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaPrecioSal'
            ].precioSal.precio.precio['ns1:valorTotal'].text()
          );
          if (
            respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaPrecioSal'
            ].precioSal.precio.precio['ns1:valorTotal'].text() !== '0'
          ) {
            let precio = {};

            precio.valorTotal = respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaPrecioSal'
            ].precioSal.precio.precio['ns1:valorTotal'].text();
            precio.valorIVA = respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaPrecioSal'
            ].precioSal.precio.precio['ns1:valorIVA'].text();
            precio.valorBase = respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaPrecioSal'
            ].precioSal.precio['ns2:valorBase'].text();
            precio.descuento = respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaPrecioSal'
            ].precioSal.precio['ns2:descuento'].text();
            precio.requierePin = respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaPrecioSal'
            ].precioSal.precio['ns2:requierePin'].text();
            console.log(precio);
            res.json(precio);
          } else {
            errors.mensaje =
              'El contrato seleccionado no requiere de la compra de vales.';
            return res.status(400).json(errors);
          }
        });
      } catch (e) {
        console.log(e);
        console.log('Error');
        errors.mensaje =
          'No hay conexión con los servicios de Colsanitas, por favor intente de nuevo en unos minutos.';
        return res.status(400).json(errors);
      }
    })();
  }
});

// @Route  POST api/beneficiarios/consultaVales
// @Desc   Consultar Vales de un Beneficiario
// @Access Public
router.post('/consultaVales', (req, res) => {
  const beneficiario = req.body.data;
  console.log('Entro a consultar vales d eusuario:', beneficiario);
  const errors = {};

  //Ir y consultar vales de usuario
  const url =
    'https://' +
    dominioWebService +
    '.colsanitas.com/services/GestionPines.GestionPinesHttpSoap12Endpoint';

  const headers = {
    'user-agent': 'sampleTest',
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction:
      'http://www.colsanitas.com/GestionPines/ConsultarDisponibilidadPinesFam'
  };

  //const xml = fs.readFileSync("test/zipCodeEnvelope.xml", "utf-8");
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ges="http://www.colsanitas.com/GestionPines/" xmlns:com="http://www.colsanitas.com/schema/osi/comun" xmlns:srv="http://www.colsanitas.com/schema/osi/srv">
  <soapenv:Header>
     <ges:HeaderRqust>
        <header>
           <com:user>
              <com:userName>800149384.prest</com:userName>
              <com:userToken>800149384.prest</com:userToken>
           </com:user>
        </header>
     </ges:HeaderRqust>
  </soapenv:Header>
  <soapenv:Body>
     <ges:ConsultaDisponibilidadPinesFamEnt>
        <consulta>
           <srv:consulta>
              <srv:codigoCompania>${
                beneficiario.contratos[0].codigoCompania
              }</srv:codigoCompania>
              <srv:codigoPlan>${
                beneficiario.contratos[0].codigoPlan
              }</srv:codigoPlan>
              <srv:numeroContrato>${
                beneficiario.contratos[0].numeroContrato
              }</srv:numeroContrato>
           </srv:consulta>
           <srv:numeroFlia>${
             beneficiario.contratos[0].numeroFamilia
           }</srv:numeroFlia>
        </consulta>
     </ges:ConsultaDisponibilidadPinesFamEnt>
  </soapenv:Body>
</soapenv:Envelope>`;

  (async () => {
    try {
      const { response } = await soapRequest(url, headers, xml, 10000000); // Optional timeout parameter(milliseconds)
      const { body, statusCode } = response;
      xmlreader.read(body, function(err, respuesta) {
        if (err) return console.log('Error reading XML:', err);

        if (
          respuesta['soapenv:Envelope']['soapenv:Body'][
            'ns4:ConsultaDisponibilidadPinesFamSal'
          ]
        ) {
          //encontró pines
          beneficiario.vale = {
            tiene: true,
            codPin: respuesta['soapenv:Envelope']['soapenv:Body'][
              'ns4:ConsultaDisponibilidadPinesFamSal'
            ].pinesDisp
              .at(0)
              .pin['ns1:codPin'].text()
          };
          console.log('Encontro vale:', beneficiario.vale);
          res.json(beneficiario);
        } else {
          //enviamos valor false para confirmar que se busco vale pero el usuario no tiene
          beneficiario.vale = {
            tiene: false
          };
          res.json(beneficiario);
        }
      });
    } catch (e) {
      //console.log(e);
      xmlreader.read(e, function(err, respuesta) {
        if (err) return console.log('Error reading XML:', err);

        if (
          respuesta['soapenv:Envelope']['soapenv:Body'][
            'soapenv:Fault'
          ].faultstring.text() ===
          'No existen pines habilitados asociados al contrato y familia del afiliado'
        ) {
          console.log('el asociado no tiene Vales/pines disponibles');
          //enviamos valor false para confirmar que se busco vale pero el usuario no tiene
          beneficiario.vale = {
            tiene: false
          };
          res.json(beneficiario);
        } else {
          console.log(
            'Se presento un error al consultar pines disponibles:',
            e
          );
          errors.mensaje =
            'No hay conexión con los servicios de Colsanitas, por favor intente de nuevo en unos minutos.';
          return res.status(400).json(errors);
        }
      });
    }
  })();
});

const extraerContratos = contratosXml => {
  const contratos = [];
  contratosXml.each((i, contratoXml) => {
    const contrato = {
      nombreProducto: contratoXml.InformacionBasicadelContrato.nombreProducto.text(),
      numeroContrato: contratoXml.InformacionBasicadelContrato.numContrato.text(),
      estadoContrato: contratoXml.InformacionBasicadelContrato.codEstadoContrato.text(),
      estadoUsuario: contratoXml.EstadoUsuarioPrestacionServicio.estadoHabilitado.text(),
      tipoUsuario: contratoXml.InformacionBeneficiarios.tipoUsuario.text(),
      codigoTipoUsuario: contratoXml.InformacionBeneficiarios.codigoTipoUsuario.text(),
      codigoCompania: contratoXml.InformacionBasicadelContrato.producto.text(),
      nombreCompania: contratoXml.InformacionBasicadelContrato.nombreProducto.text(),
      codigoPlan: contratoXml.InformacionBasicadelContrato.codigoPlan.text(),
      nombrePlan: contratoXml.InformacionBasicadelContrato.nombrePlan.text(),
      numeroFamilia: contratoXml.InformacionBasicadelContrato.numeroFamilia.text(),
      estadoTitularFamilia: contratoXml.InformacionBasicadelContrato.estadoTitularFamilia.text(),
      fechaPrestacionDeServicio: new Date(
        contratoXml.EstadoUsuarioPrestacionServicio.fechaConsultaPrestacionServicio.text()
      ),
      fechaFinVigencia: new Date(
        contratoXml.InformacionBeneficiarios.fechaFinVigencia.text()
      )
    };

    if (
      (contrato.codigoCompania != '10' && contrato.codigoCompania != '20') ||
      planesExcluidos.includes(contrato.codigoPlan) ||
      contratosEspeciales.includes(contrato.numeroContrato)
    ) {
      contrato.error =
        'El contrato seleccionado no requiere de la compra de Vales.';
    } else {
      if (contrato.estadoContrato === '4') {
        //contrato Liquidado, verificar si el usuario está o no HABILITADO
        if (contrato.estadoUsuario === 'HABILITADO') {
          //estado contrato y estado usuario correctos
          contrato.error = false;
        } else {
          //Estado de usuario NO HABILITADO
          contrato.error =
            'Su  contrato  se  encuentra pendiente de pagos acérquese a Asesoría integral o comuníquese a la Línea Nro. 4871920';
        }
      } else if (contrato.estadoContrato === '1') {
        //contrato cancelado, revisar si está o No HABILITADO
        var q = new Date();
        var m = q.getMonth();
        var d = q.getDate();
        var y = q.getFullYear();

        const currentDate = new Date(y, m, d);
        console.log('Fecha Vigencia:', contrato.fechaFinVigencia);
        console.log('Fecha Actual:', currentDate);
        if (contrato.fechaFinVigencia >= currentDate) {
          contrato.error = false;
        } else {
          contrato.error =
            'Contrato cancelado, acérquese a Asesoría integral o comuníquese a la Línea Nro. 4871920';
        }
        /*if (contrato.estadoUsuario === "HABILITADO") {
          console.log("Fecha:", contrato.fechaFinVigencia);
          if (contrato.fechaFinVigencia >= Date.now()) {
            //contrato cancelado pero aun vigente
            contrato.error = false;
          } else {
            contrato.error =
              "Contrato cancelado, acérquese a Asesoría integral o comuníquese a la Línea Nro. 4871920";
          }
        } else {
          console.log("Fecha:", contrato.fechaFinVigencia);
          console.log("Fecha:", Date.now());
          if (contrato.fechaFinVigencia >= Date.now()) {
            //contrato cancelado pero aun vigente
            contrato.error = false;
          } else {
            contrato.error =
              "Contrato cancelado, acérquese a Asesoría integral o comuníquese a la Línea Nro. 4871920";
          }
        }*/
      }
    }

    if (contratosEspeciales.includes(contrato.numeroContrato)) {
      contrato.error =
        'El contrato seleccionado no requiere de la compra de Vales.';
    }
    contratos.push(contrato);
  });
  return contratos;
};

let consultarCitasPromise = beneficiario => {
  return new Promise((resolve, reject) => {
    let hoy = new Date();
    let dd = hoy.getDate();
    let mm = hoy.getMonth() + 1;
    const yyyy = hoy.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    //hoy = `${dd}-${mm}-${yyyy}`; //original
    hoy = `24-05-${yyyy}`; //pruebas
    axios
      .get(
        `https://colsanitas.bukeala.com/api/colsanitas/v1/queryBookings?hashKey=UpuhivXEGg6qANqpEh9a&partnerCode=CIEL&tipoIdentificacion=${
          beneficiario.codTipoIdentificacion
        }&numeroIdentificacion=${
          beneficiario.numeroIdentificacion
        }&fechaDesde=${hoy}&fechaHasta=${hoy}`
      )
      .then(function(response) {
        beneficiario.citas = response.data.bookings;
        resolve(beneficiario);
      })
      .catch(function(error) {
        (errors.mensaje = 'Error buscando citas en Bukeala:'), error;
        reject(errors);
      });
  });
};

module.exports = router;
