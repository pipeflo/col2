import {
  SET_DATOS_COMPRA,
  SET_CONTRATO,
  SET_VALOR_VALE,
  BORRAR_COMPRA_ACTUAL,
  CONTRATO_LOADING,
  TIRA_AUDITORA_LOADING
} from "../actions/types";

const initialState = {
  cargando: false,
  inicioCompra: false,
  valorVale: 0,
  valorTotal: 0,
  cantidad: 0,
  stringCompra: "",
  contrato: {},
  tiraAuditora: {},
  idTransaccion: 0,
  transaccion: "",
  valeElectronico: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_DATOS_COMPRA:
      return {
        ...state,
        ...action.payload,
        cargando: false
      };
    case SET_CONTRATO:
      return {
        ...state,
        contrato: action.payload
      };
    case SET_VALOR_VALE:
      return {
        ...state,
        contrato: action.payload.contrato,
        valorVale: action.payload.precio.valorTotal,
        cargando: false
      };
    case BORRAR_COMPRA_ACTUAL:
      return {
        ...initialState
      };
    case CONTRATO_LOADING:
      return {
        ...initialState,
        cargando: action.payload
      };
    case TIRA_AUDITORA_LOADING:
      return {
        ...state,
        cargando: action.payload
      };
    default:
      return state;
  }
}
