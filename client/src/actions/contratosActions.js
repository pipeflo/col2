import axios from 'axios';
import {
  GET_ERRORS,
  SET_VALOR_VALE,
  SET_VALE_BENEFICIARIO,
  CONTRATO_LOADING,
  SET_INDEX_CITA
} from './types';

export const buscarVales = (beneficiario, indexCita) => dispatch => {
  dispatch(setContratoLoading(true));
  dispatch({ type: SET_INDEX_CITA, payload: indexCita });
  //buscar vales disponibles
  axios
    .post('/api/beneficiarios/consultaVales', { data: beneficiario })
    .then(res => {
      console.log('llegó beneficiario con vales:', res.data);
      //dispatch de Beneficiario con Vale
      dispatch(setContratoLoading(false));
      dispatch({
        type: SET_VALE_BENEFICIARIO,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
      dispatch(setContratoLoading(false));
    });
};

export const agregarContrato = (contratoData, beneficiario) => dispatch => {
  dispatch(setContratoLoading(true));
  //Traer código de ciudad
  axios
    .post('/api/beneficiarios/ciudad', contratoData)
    .then(res => {
      contratoData = res.data;
      //Llamar API para traer precio de vale
      const infoCompra = {
        beneficiario: beneficiario,
        contrato: contratoData
      };
      axios
        .post('/api/beneficiarios/precio', infoCompra)
        .then(res => {
          //Se consulta precio vale y se envia a reducer
          const compra = {
            contrato: contratoData,
            precio: res.data
          };
          dispatch({
            type: SET_VALOR_VALE,
            payload: compra
          });
        })
        .catch(err => {
          dispatch(setContratoLoading(false));
          dispatch({
            type: GET_ERRORS,
            payload: err.response.data
          });
        });
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
      dispatch(setContratoLoading(false));
    });
};

//cambiar estado de cargando beneficiario
export const setContratoLoading = cargando => {
  return {
    type: CONTRATO_LOADING,
    payload: cargando
  };
};

export const setErrors = errors => dispatch => {
  dispatch({
    type: GET_ERRORS,
    payload: errors
  });
};
