import axios from "axios";
import {
  GET_ERRORS,
  SET_TIPOS_IDENTIFICACION,
  TIPOS_IDENTIFICACION_LOADING,
  SET_TIPO_IDENTIFICACION_BENEFICIARIO,
  CLEAR_ERRORS
} from "./types";

//
export const traerTiposIdentificacion = () => dispatch => {
  dispatch(setTiposIdentificacionLoading(true));
  dispatch(clearErrors());
  axios
    .get("/api/tiposIdentificacion")
    .then(res => {
      dispatch(setTiposIdentificacion(res.data));
    })
    .catch(err => {
      console.log("Entro al catch: ", err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
      dispatch(setTiposIdentificacionLoading(false));
    });
};

export const asignarTipoIdentificacion = tipoIdentificacion => dispatch => {
  dispatch({
    type: SET_TIPO_IDENTIFICACION_BENEFICIARIO,
    payload: tipoIdentificacion
  });
};

//cambiar estado de cargando beneficiario
export const setTiposIdentificacionLoading = cargando => {
  return {
    type: TIPOS_IDENTIFICACION_LOADING,
    payload: cargando
  };
};

//poner tipos de identificacion
export const setTiposIdentificacion = tiposIdentificacion => {
  return {
    type: SET_TIPOS_IDENTIFICACION,
    payload: tiposIdentificacion
  };
};

//Borrar errores
export const clearErrors = () => {
  return {
    type: CLEAR_ERRORS
  };
};
