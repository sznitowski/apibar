// Action types
export const FETCH_VENTAS_REQUEST     = "FETCH_VENTAS_REQUEST";
export const FETCH_VENTAS_SUCCESS     = "FETCH_VENTAS_SUCCESS";
export const FETCH_VENTAS_FAILURE     = "FETCH_VENTAS_FAILURE";

export const FETCH_CONSUMO_REQUEST    = "FETCH_CONSUMO_REQUEST";
export const FETCH_CONSUMO_SUCCESS    = "FETCH_CONSUMO_SUCCESS";
export const FETCH_CONSUMO_FAILURE    = "FETCH_CONSUMO_FAILURE";

export const FETCH_STOCK_REQUEST      = "FETCH_STOCK_REQUEST";
export const FETCH_STOCK_SUCCESS      = "FETCH_STOCK_SUCCESS";
export const FETCH_STOCK_FAILURE      = "FETCH_STOCK_FAILURE";

export const FETCH_VENTAS_DET_REQUEST = "FETCH_VENTAS_DET_REQUEST";
export const FETCH_VENTAS_DET_SUCCESS = "FETCH_VENTAS_DET_SUCCESS";
export const FETCH_VENTAS_DET_FAILURE = "FETCH_VENTAS_DET_FAILURE";

// Nuevas (auxiliares para UI del VentasDashboard)
export const FETCH_CATS_REQUEST       = "FETCH_CATS_REQUEST";
export const FETCH_CATS_SUCCESS       = "FETCH_CATS_SUCCESS";
export const FETCH_CATS_FAILURE       = "FETCH_CATS_FAILURE";

export const SEARCH_PROD_REQUEST      = "SEARCH_PROD_REQUEST";
export const SEARCH_PROD_SUCCESS      = "SEARCH_PROD_SUCCESS";
export const SEARCH_PROD_FAILURE      = "SEARCH_PROD_FAILURE";

// Base API (CRA usa REACT_APP_*)
const API  = process.env.REACT_APP_API_URL || "http://localhost:5000";
// si montaste app.use('/api', ...):
const BASE = `${API}/api/ventas`;
// si NO tenés prefijo '/api', usá:
// const BASE = `${API}/ventas`;

// ---- Helpers
const isNonEmpty = (v) => v !== undefined && v !== null && String(v).trim() !== "";
const joinIfArray = (v) => Array.isArray(v) ? v.filter(isNonEmpty).join(",") : v;

// ---- Acciones existentes ----

// Ventas resumen
export const fetchVentas = () => async (dispatch) => {
  dispatch({ type: FETCH_VENTAS_REQUEST });
  try {
    const r = await fetch(`${BASE}/resumen`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    dispatch({ type: FETCH_VENTAS_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: FETCH_VENTAS_FAILURE, error: e.message });
  }
};

// Consumo detallado
export const fetchConsumo = () => async (dispatch) => {
  dispatch({ type: FETCH_CONSUMO_REQUEST });
  try {
    const r = await fetch(`${BASE}/consumo`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    dispatch({ type: FETCH_CONSUMO_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: FETCH_CONSUMO_FAILURE, error: e.message });
  }
};

// Stock (opcional: acepta filtros para el StockDashboard)
export const fetchStock = (params = {}) => async (dispatch) => {
  dispatch({ type: FETCH_STOCK_REQUEST });
  try {
    const qs = new URLSearchParams();
    if (isNonEmpty(params.q)) qs.set("q", params.q);
    if (params.categorias)  qs.set("categorias", joinIfArray(params.categorias));
    if (params.ids)         qs.set("ids", joinIfArray(params.ids));

    const url = `${BASE}/stock${qs.toString() ? `?${qs}` : ""}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    dispatch({ type: FETCH_STOCK_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: FETCH_STOCK_FAILURE, error: e.message });
  }
};

// ---- NUEVO: Ventas detalladas con filtros modernos (categorias/productos/q) ----
export const fetchVentasDetalladas = (params = {}) => async (dispatch) => {
  dispatch({ type: FETCH_VENTAS_DET_REQUEST });
  try {
    const qs = new URLSearchParams();

    if (isNonEmpty(params.from))       qs.set("from", params.from);         // YYYY-MM-DD
    if (isNonEmpty(params.to))         qs.set("to", params.to);             // YYYY-MM-DD
    if (isNonEmpty(params.pago))       qs.set("pago", params.pago);
    if (isNonEmpty(params.q))          qs.set("q", params.q);

    // soporta array o string (el back acepta x=y,z o repetidos; acá mandamos comma-separated)
    if (params.categorias && params.categorias.length) {
      qs.set("categorias", joinIfArray(params.categorias));
    }
    if (params.productos && params.productos.length) {
      qs.set("productos", joinIfArray(params.productos));
    }

    const url = `${BASE}/detalladas?${qs.toString()}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    dispatch({ type: FETCH_VENTAS_DET_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: FETCH_VENTAS_DET_FAILURE, error: e.message });
  }
};

// ---- NUEVO: Auxiliares para UI del VentasDashboard ----

// Categorías únicas (para el select con búsqueda)
export const fetchCategorias = () => async (dispatch) => {
  dispatch({ type: FETCH_CATS_REQUEST });
  try {
    const r = await fetch(`${BASE}/stock?meta=categories`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json(); // ["alcohol","soft drink",...]
    dispatch({ type: FETCH_CATS_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: FETCH_CATS_FAILURE, error: e.message });
  }
};

// Sugerencias de productos (para el autocomplete)
// q: texto, limit: máx resultados
export const searchProductos = (q, limit = 20) => async (dispatch) => {
  dispatch({ type: SEARCH_PROD_REQUEST, meta: { q } });
  try {
    const qs = new URLSearchParams({ meta: "products" });
    if (isNonEmpty(q)) qs.set("q", q);
    if (limit) qs.set("limit", String(limit));

    const r = await fetch(`${BASE}/stock?${qs.toString()}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json(); // [{id,name,category}, ...]
    dispatch({ type: SEARCH_PROD_SUCCESS, payload: data, meta: { q } });
  } catch (e) {
    dispatch({ type: SEARCH_PROD_FAILURE, error: e.message, meta: { q } });
  }
};
