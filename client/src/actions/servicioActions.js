import axios from 'axios';
import {
  GET_ERRORS,
  SET_ACCESS_TOKEN,
  ACCESS_TOKEN_LOADING,
  CLEAR_ERRORS
} from './types';

//
export const traerAccessToken = () => dispatch => {
  dispatch(setAccessTokenLoading(true));
  dispatch(clearErrors());
  //generar access_token
  axios
    .get('/api/auth')
    .then(res => {
      console.log('Access token: ', res.data);
      dispatch(setAccessToken(res.data.access_token));
    })
    .catch(err => {
      console.log('Entro al catch: ', err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
      dispatch(setAccessTokenLoading(false));
    });
};

//cambiar estado de cargando beneficiario
export const setAccessTokenLoading = cargando => {
  return {
    type: ACCESS_TOKEN_LOADING,
    payload: cargando
  };
};

//poner tipos de identificacion
export const setAccessToken = access_token => {
  return {
    type: SET_ACCESS_TOKEN,
    payload: access_token
  };
};

//Borrar errores
export const clearErrors = () => {
  return {
    type: CLEAR_ERRORS
  };
};
