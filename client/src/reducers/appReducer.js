import {
  SET_ACCESS_TOKEN,
  ACCESS_TOKEN_LOADING,
  BORRAR_ACCESS_TOKEN
} from '../actions/types';

const initialState = {
  access_token: '',
  cargando: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case ACCESS_TOKEN_LOADING:
      return {
        ...initialState,
        cargando: action.payload
      };
    case SET_ACCESS_TOKEN:
      return {
        access_token: action.payload,
        cargando: false
      };
    case BORRAR_ACCESS_TOKEN:
      return {
        ...initialState
      };
    default:
      return state;
  }
}
