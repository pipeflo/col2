import axios from "axios";
import { SET_DATOS_COMPRA, TIRA_AUDITORA_LOADING, GET_ERRORS } from "./types";

//Registrar Compra
export const registrarCompra = (beneficiario, compra) => dispatch => {
  dispatch({
    type: TIRA_AUDITORA_LOADING,
    payload: true
  });
  const infoCompra = {
    beneficiario: beneficiario,
    compra: compra
  };
  //Llamar API para registrar compra con Colsanitas
  axios
    .post("/api/compra/registrar", infoCompra)
    .then(res => {
      console.log("Datos despues de registrar compra:", res.data.compra);
      dispatch(setCompra(res.data.compra));
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });

      dispatch({
        type: TIRA_AUDITORA_LOADING,
        payload: false
      });
    });
};

//Traer Documento Equivalente
export const consultarTiraAuditoria = compra => dispatch => {
  dispatch({
    type: TIRA_AUDITORA_LOADING,
    payload: true
  });
  //Llamar API para registrar compra con Colsanitas
  axios
    .post("/api/compra/tiraAuditoria", compra)
    .then(res => {
      //se crea el archivo, se debe enviar a pantalla de espera (instrucciones de compra en datafono), el servicio retorna trama de transacción
      console.log("Llamado exitoso de traer tira:", res.data);
      dispatch(setCompra(res.data));
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
      dispatch({
        type: TIRA_AUDITORA_LOADING,
        payload: false
      });
    });
};

//Set datos compra
export const setCompra = data => {
  return {
    type: SET_DATOS_COMPRA,
    payload: data
  };
};
