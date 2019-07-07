const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs');

// @Route  GET api/auth/test
// @Desc   Test Users route
// @Access Public
router.get('/test', (req, res) => res.json({ msg: 'Test Funciona' }));

// @Route  GET api/auth
// @Desc   Get Papi Access Token
// @Access Public
router.get('/', (req, res) => {
  const errors = {};
  const requestBody = {
    grant_type: 'password',
    username: 'caracaicedo',
    password: 'ISuSYAmzYtA8pO6BwH1M'
  };
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic alk0NFNrVkVvVWNNanRDUGFFenhJSTBrcWZNYTpsZW9VNEpuT0pkUnpZclFkanlyYklMZXY0ejhh'
    }
  };
  axios
    .post(
      'https://papi.colsanitas.com/token',
      qs.stringify(requestBody),
      config
    )
    .then(function(response) {
      res.json(response.data);
    })
    .catch(function(error) {
      errors.mensaje =
        "Error al traer token de acceso 'API Papi': " + error.message;
      return res.status(400).json(errors);
    });
});

module.exports = router;
