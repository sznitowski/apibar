// reducers/index.js

import { combineReducers } from "redux";
import productReducer from "./productReducer";
import mesaReducer from "./mesaReducer";
import ventaReducer from "./ventaReducer";
import authReducer from "./authReducer";

export default combineReducers({
  products: productReducer,
  mesas: mesaReducer,
  ventas: ventaReducer,
  auth: authReducer,
});
