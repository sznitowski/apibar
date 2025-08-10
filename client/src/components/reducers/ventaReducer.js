// src/reducers/ventaReducer.js
import {
  FETCH_VENTAS_REQUEST,
  FETCH_VENTAS_SUCCESS,
  FETCH_VENTAS_FAILURE,
  FETCH_CONSUMO_REQUEST,
  FETCH_CONSUMO_SUCCESS,
  FETCH_CONSUMO_FAILURE,
  FETCH_STOCK_REQUEST,
  FETCH_STOCK_SUCCESS,
  FETCH_STOCK_FAILURE,
  FETCH_VENTAS_DET_REQUEST,
  FETCH_VENTAS_DET_SUCCESS,
  FETCH_VENTAS_DET_FAILURE,
} from "../actions/ventaActions";

const initial = {
  ventas: [],
  consumo: [],
  stock: [],
  ventasDet: [], // <- nuevo
  loading: { ventas: false, consumo: false, stock: false, ventasDet: false }, // <- nuevo
  error: null,
};

export default function ventasReducer(state = initial, action) {
  switch (action.type) {
    // Ventas (resumen)
    case FETCH_VENTAS_REQUEST:
      return { ...state, loading: { ...state.loading, ventas: true } };
    case FETCH_VENTAS_SUCCESS:
      return {
        ...state,
        ventas: action.payload,
        loading: { ...state.loading, ventas: false },
      };
    case FETCH_VENTAS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, ventas: false },
        error: action.error,
      };

    // Consumo (detalle simple)
    case FETCH_CONSUMO_REQUEST:
      return { ...state, loading: { ...state.loading, consumo: true } };
    case FETCH_CONSUMO_SUCCESS:
      return {
        ...state,
        consumo: action.payload,
        loading: { ...state.loading, consumo: false },
      };
    case FETCH_CONSUMO_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, consumo: false },
        error: action.error,
      };

    // src/reducers/ventaReducer.js
    case FETCH_STOCK_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, stock: true },
        error: null,
      };
    case FETCH_STOCK_SUCCESS:
      return {
        ...state,
        stock: action.payload,
        loading: { ...state.loading, stock: false },
        error: null, // <- limpiar error global
      };
    // idem para VENTAS/CONSUMO/VENTAS_DET

    // Ventas detalladas (dashboard)
    case FETCH_VENTAS_DET_REQUEST:
      return { ...state, loading: { ...state.loading, ventasDet: true } };
    case FETCH_VENTAS_DET_SUCCESS:
      return {
        ...state,
        ventasDet: action.payload,
        loading: { ...state.loading, ventasDet: false },
      };
    case FETCH_VENTAS_DET_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, ventasDet: false },
        error: action.error,
      };

    default:
      return state;
  }
}
