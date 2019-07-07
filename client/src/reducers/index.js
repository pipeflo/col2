import { combineReducers } from 'redux';
import appReducer from './appReducer';
import tiposIdentificacionReducer from './tiposIdentificacionReducer';
import beneficiarioReducer from './beneficiarioReducer';
import cantidadReducer from './compraReducer';
import errorReducer from './errorReducer';

export default combineReducers({
  app: appReducer,
  tiposIdentificacion: tiposIdentificacionReducer,
  beneficiario: beneficiarioReducer,
  compra: cantidadReducer,
  errors: errorReducer
});
