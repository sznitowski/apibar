// reducers/index.js

import { combineReducers } from 'redux';
import productReducer from './productReducer';
import mesaReducer from './mesaReducer';

export default combineReducers({
  products: productReducer,
  mesas: mesaReducer,
});
