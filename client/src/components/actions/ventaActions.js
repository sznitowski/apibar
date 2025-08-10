// Action types
export const FETCH_VENTAS_REQUEST = "FETCH_VENTAS_REQUEST";
export const FETCH_VENTAS_SUCCESS = "FETCH_VENTAS_SUCCESS";
export const FETCH_VENTAS_FAILURE = "FETCH_VENTAS_FAILURE";

export const FETCH_CONSUMO_REQUEST = "FETCH_CONSUMO_REQUEST";
export const FETCH_CONSUMO_SUCCESS = "FETCH_CONSUMO_SUCCESS";
export const FETCH_CONSUMO_FAILURE = "FETCH_CONSUMO_FAILURE";

export const FETCH_STOCK_REQUEST = "FETCH_STOCK_REQUEST";
export const FETCH_STOCK_SUCCESS = "FETCH_STOCK_SUCCESS";
export const FETCH_STOCK_FAILURE = "FETCH_STOCK_FAILURE";

export const FETCH_VENTAS_DET_REQUEST = "FETCH_VENTAS_DET_REQUEST";
export const FETCH_VENTAS_DET_SUCCESS = "FETCH_VENTAS_DET_SUCCESS";
export const FETCH_VENTAS_DET_FAILURE = "FETCH_VENTAS_DET_FAILURE";

// Base API (CRA usa REACT_APP_*)
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ⬅️ Si en app.ts hiciste: app.use('/api', ventaRoutes)
const BASE = `${API}/api/ventas`;
// ⬅️ Si NO tenés prefijo '/api', usá:
// const BASE = `${API}/ventas`;

// Ventas resumen
export const fetchVentas = () => async (dispatch) => {
  dispatch({ type: FETCH_VENTAS_REQUEST });
  try {
    const r = await fetch(`${BASE}/resumen`).then(res => res.json());
    dispatch({ type: FETCH_VENTAS_SUCCESS, payload: r });
  } catch (e) {
    dispatch({ type: FETCH_VENTAS_FAILURE, error: e.message });
  }
};

// Consumo detallado
export const fetchConsumo = () => async (dispatch) => {
  dispatch({ type: FETCH_CONSUMO_REQUEST });
  try {
    const r = await fetch(`${BASE}/consumo`).then(res => res.json());
    dispatch({ type: FETCH_CONSUMO_SUCCESS, payload: r });
  } catch (e) {
    dispatch({ type: FETCH_CONSUMO_FAILURE, error: e.message });
  }
};

// Stock
export const fetchStock = () => async (dispatch) => {
  dispatch({ type: FETCH_STOCK_REQUEST });
  try {
    const r = await fetch(`${BASE}/stock`).then(res => res.json());
    dispatch({ type: FETCH_STOCK_SUCCESS, payload: r });
  } catch (e) {
    dispatch({ type: FETCH_STOCK_FAILURE, error: e.message });
  }
};


export const fetchVentasDetalladas = (params = {}) => async (dispatch) => {
  dispatch({ type: FETCH_VENTAS_DET_REQUEST });
  try {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.mesa != null) qs.set("mesa", params.mesa);
    if (params.categoria) qs.set("categoria", params.categoria);
    if (params.pago) qs.set("pago", params.pago);

    const r = await fetch(`${API}/ventas/detalladas?${qs.toString()}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    dispatch({ type: FETCH_VENTAS_DET_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: FETCH_VENTAS_DET_FAILURE, error: e.message });
  }
};