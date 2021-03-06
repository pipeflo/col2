module.exports = {
  mongoURI: 'mongodb://localhost:27017/kioscolsanitas',
  numeroTerminal: '000ZV856',
  dominioWebService: 'osiapppre02', //osiapppre02 - PRUEBAS  //services01 - PROD
  consultaPrecio: {
    userName: 'casender.prest',
    userToken: '123',
    codigoCiudad: '11001'
  },
  registrarCompra: {
    canal: '602.prest',
    codigoCiudad: '11001',
    codigoConcepto: '11',
    codigoEstacion: '602',
    aplicacionAsigna: 'KIOSKO_602'
  },
  planesExcluidos: ['55', '39', '33', '67', '16', '32', '12', '14', '25', '29'],
  codigoCompaniaExcluidos: ['30', '31'],
  contratosEspeciales: [
    '101445',
    '101456',
    '10552000',
    '101614',
    '1012',
    '101617',
    '101618',
    '101619',
    '10161',
    '10162',
    '10165',
    '10166',
    '10167',
    '101616',
    '10168',
    '10169',
    '101610',
    '101620',
    '1010316932',
    '1010316933',
    '1010316934',
    '2060231345',
    '101626',
    '1010351093',
    '1010351094',
    '2060246239',
    '10322491',
    '10108039255',
    '10108039256',
    '10108039257',
    '10108039258',
    '10108039259',
    '10108039260',
    '10108039261',
    '10108039262',
    '10108039263',
    '10108039264',
    '10108039265',
    '10108041430'
  ],
  especialidadesSinPapeleo: [
    '004',
    '063',
    '133',
    '341',
    '385',
    '387',
    '410',
    '480',
    '514',
    '550',
    '590',
    '734',
    '752',
    '782'
  ],
  planesSinPago: ['55', '56', '67']
};
