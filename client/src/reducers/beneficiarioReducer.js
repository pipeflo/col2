import {
  SET_BENEFICIARIO,
  BENEFICIARIO_LOADING,
  BORRAR_BENEFICIARIO_ACTUAL,
  SET_TIPO_IDENTIFICACION_BENEFICIARIO,
  SET_VALE_BENEFICIARIO
} from '../actions/types';

const initialState = {
  nombre: '',
  tipoIdentificacion: '',
  codTipoIdentificacion: '',
  tipoIdentificacionNombre: '',
  numeroIdentificacion: '',
  contratos: [],
  citas: [],
  vale: {},
  cargando: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case BENEFICIARIO_LOADING:
      return {
        ...state,
        cargando: action.payload
      };
    case BORRAR_BENEFICIARIO_ACTUAL:
      return {
        ...initialState
      };
    case SET_BENEFICIARIO:
      return {
        ...action.payload,
        cargando: false
      };
    case SET_TIPO_IDENTIFICACION_BENEFICIARIO:
      return {
        ...state,
        tipoIdentificacion: action.payload.tipoIdentificacion,
        codTipoIdentificacion: action.payload.codTipoIdentificacion,
        tipoIdentificacionNombre: action.payload.descripcion
      };
    case SET_VALE_BENEFICIARIO:
      return {
        ...state,
        vale: action.payload.vale
      };
    default:
      return state;
  }
}
