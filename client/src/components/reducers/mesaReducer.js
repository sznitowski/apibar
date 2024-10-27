// reducers/mesaReducer.js
const initialState = {
  loading: false,
  mesas: [],
  error: null,
};

const mesaReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_MESAS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_MESAS_SUCCESS':
      return { ...state, loading: false, mesas: action.payload };
    case 'FETCH_MESAS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    // Agrega más casos según sea necesario para las otras acciones
    default:
      return state;
  }
};

export default mesaReducer;
