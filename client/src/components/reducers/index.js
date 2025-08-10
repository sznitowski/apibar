// reducers/index.js

import { combineReducers } from "redux";
import productReducer from "./productReducer";
import mesaReducer from "./mesaReducer";
import ventaReducer from "./ventaReducer";

export default combineReducers({
  products: productReducer,
  mesas: mesaReducer,
  ventas: ventaReducer,
});
