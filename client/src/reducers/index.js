import { combineReducers } from "redux";
import tiposIdentificacionReducer from "./tiposIdentificacionReducer";
import beneficiarioReducer from "./beneficiarioReducer";
import cantidadReducer from "./compraReducer";
import errorReducer from "./errorReducer";

export default combineReducers({
  tiposIdentificacion: tiposIdentificacionReducer,
  beneficiario: beneficiarioReducer,
  compra: cantidadReducer,
  errors: errorReducer
});
