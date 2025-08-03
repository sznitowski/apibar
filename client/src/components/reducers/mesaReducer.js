import {
  FETCH_MESAS_LOADING,
  FETCH_MESAS_SUCCESS,
  FETCH_MESAS_ERROR,
  FETCH_MESAS_CONSUMO_LOADING,
  FETCH_MESAS_CONSUMO_SUCCESS,
  FETCH_MESAS_CONSUMO_ERROR,
  ASSIGN_PRODUCTS_TO_MESA,
  CREATE_MESA_REQUEST,
  CREATE_MESA_SUCCESS,
  CREATE_MESA_FAILURE,
  ADD_MESA,
  UPDATE_MESA,
  DELETE_MESA,
  SET_TEMP_MESA_DATA,
  CLEAR_TEMP_MESA_DATA,
  SET_ALL_TEMP_MESA_DATA,
} from "../actions/types";

const initialState = {
  loading: false, // Indicador de carga general
  error: null, // Error general
  mesas: [], // Lista de mesas
  estadoLoading: false, // Indicador de carga para consumo/estado
  estadoError: null, // Error relacionado con consumo/estado
  consumo: [], // Datos de consumo de las mesas
  consumoTemporal: {}, // <- Datos de consumo de las mesas TEMPORAL
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_MESAS_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_MESAS_SUCCESS:
      return {
        ...state,
        loading: false,
        mesas: action.payload,
      };
    case FETCH_MESAS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_MESAS_CONSUMO_LOADING:
      return {
        ...state,
        estadoLoading: true,
        estadoError: null,
      };
    case FETCH_MESAS_CONSUMO_SUCCESS:
      return {
        ...state,
        estadoLoading: false,
        consumo: action.payload,
      };
    case FETCH_MESAS_CONSUMO_ERROR:
      return {
        ...state,
        estadoLoading: false,
        estadoError: action.payload,
      };

    case ASSIGN_PRODUCTS_TO_MESA:
      return {
        ...state,
        mesas: state.mesas.map((mesa) =>
          mesa.id === action.payload.mesaId
            ? { ...mesa, consumo: action.payload.productIds }
            : mesa
        ),
      };

    case CREATE_MESA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CREATE_MESA_SUCCESS:
      return {
        ...state,
        loading: false,
        mesas: [...state.mesas, action.payload],
      };
    case CREATE_MESA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_MESA:
      return {
        ...state,
        mesas: [...state.mesas, action.payload],
      };

    case UPDATE_MESA:
      return {
        ...state,
        mesas: state.mesas.map((mesa) =>
          mesa.id === action.payload.id ? { ...mesa, ...action.payload } : mesa
        ),
      };

    case DELETE_MESA:
      return {
        ...state,
        mesas: state.mesas.filter((mesa) => mesa.id !== action.payload),
      };

    case SET_ALL_TEMP_MESA_DATA:
      return {
        ...state,
        consumoTemporal: action.payload,
      };

    case SET_TEMP_MESA_DATA:
      return {
        ...state,
        consumoTemporal: {
          ...state.consumoTemporal,
          [action.payload.mesaId]: action.payload.data,
        },
      };

    case CLEAR_TEMP_MESA_DATA: {
      const { [action.payload]: _, ...rest } = state.consumoTemporal;
      return {
        ...state,
        consumoTemporal: rest,
      };
    }

    default:
      return state;
  }
}
