import {
  SET_TIPOS_IDENTIFICACION,
  TIPOS_IDENTIFICACION_LOADING
} from "../actions/types";

const initialState = {
  tipos: [],
  cargando: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case TIPOS_IDENTIFICACION_LOADING:
      return {
        ...initialState,
        cargando: action.payload
      };
    case SET_TIPOS_IDENTIFICACION:
      return {
        tipos: action.payload,
        cargando: false
      };
    default:
      return state;
  }
}
