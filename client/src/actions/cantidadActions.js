import axios from "axios";
import { GET_ERRORS } from "./types";
import { SET_DATOS_COMPRA } from "./types";

//
export const iniciarCompra = compraData => dispatch => {
  //Llamar API para crear archivo de compra para enviar al datafono
  axios
    .post("/api/compra/iniciar", compraData)
    .then(res => {
      //se crea el archivo, se debe enviar a pantalla de espera (instrucciones de compra en datafono), el servicio retorna trama de transacción
      console.log("Llamado exitoso de iniciar compra");
      dispatch(setCompra(res.data));
      //history.push("/esperandocompra");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Set datos compra
export const setCompra = data => {
  return {
    type: SET_DATOS_COMPRA,
    payload: data
  };
};
