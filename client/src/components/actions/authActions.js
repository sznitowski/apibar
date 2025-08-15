// src/components/actions/authActions.js
import {
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAILURE,
  AUTH_PERFIL_SUCCESS,
  AUTH_LOGOUT,
  AUTH_CLEAR_ERROR,
  AUTH_UPDATE_PROFILE_REQUEST,
  AUTH_UPDATE_PROFILE_SUCCESS,
  AUTH_UPDATE_PROFILE_FAILURE,
} from "../actions/types";

// Base de API (CRA usa REACT_APP_*)
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const API_AUTH = `${API_BASE}/auth`;
const API_USUARIOS = `${API_BASE}/usuarios`;

// Parser robusto (evita "Unexpected token P" cuando hay proxy error/html)
async function parseResponse(r) {
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await r.json();
  const text = await r.text();
  return { _raw: text };
}

/** LOGIN (thunk) */
export const login =
  ({ email, password, keep }) =>
  async (dispatch) => {
    dispatch({ type: AUTH_LOGIN_REQUEST });
    try {
      const r = await fetch(`${API_AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // para cookie httpOnly si existe
        body: JSON.stringify({ email, password }),
      });
      const data = await parseResponse(r);
      if (!r.ok) {
        throw new Error(data?.mensaje || data?._raw || "Credenciales inválidas");
      }

      // Si viene token en el body (modo JWT), guardalo
      const token = data?.accessToken || data?.token || null;
      if (token) {
        (keep ? localStorage : sessionStorage).setItem("token", token);
      }

      // Marcá autenticado (aunque no haya token, si usás cookie)
      dispatch({
        type: AUTH_LOGIN_SUCCESS,
        payload: {
          token: token || "__cookie__", // marcador simbólico
          usuario: data?.usuario ?? null,
          roles: data?.roles ?? [],
        },
      });

      // Si no vino el usuario, intentá hidratarlo
      try {
        const perfil = await fetch(`${API_USUARIOS}/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then(parseResponse);
        if (!perfil?._raw) {
          dispatch({ type: AUTH_PERFIL_SUCCESS, payload: perfil });
        }
      } catch (_) {}
    } catch (e) {
      dispatch({
        type: AUTH_LOGIN_FAILURE,
        payload: e.message || "Error de autenticación",
      });
    }
  };

/** CARGAR SESIÓN AL ARRANCAR (lee token o cookie y trae perfil) */
export const cargarSesion = () => async (dispatch) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  // si hay token en storage, marcá autenticado
  if (token) {
    dispatch({ type: AUTH_LOGIN_SUCCESS, payload: { token } });
  }
  // intentá traer perfil (funciona también con cookie httpOnly)
  try {
    const perfil = await fetch(`${API_USUARIOS}/me`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(parseResponse);

    if (!perfil?._raw) {
      dispatch({ type: AUTH_PERFIL_SUCCESS, payload: perfil });
      if (!token) {
        dispatch({ type: AUTH_LOGIN_SUCCESS, payload: { token: "__cookie__" } });
      }
    }
  } catch {
    // sesión inválida: no hacemos nada; PrivateRoute redirige
  }
};

/** LOGOUT (limpia storage y opcionalmente avisa al backend) */
export const logout = () => async (dispatch) => {
  try {
    await fetch(`${API_AUTH}/logout`, { method: "POST", credentials: "include" });
  } catch {
    // ignorar errores del logout del back
  } finally {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    dispatch({ type: AUTH_LOGOUT });
  }
};

export const clearAuthError = () => ({ type: AUTH_CLEAR_ERROR });

/** OBTENER PERFIL MANUAL (si lo necesitás en algún flujo) */
export const getPerfil = () => async (_dispatch, getState) => {
  const token = getState().auth.token;
  const r = await fetch(`${API_USUARIOS}/me`, {
    credentials: "include",
    headers: token && token !== "__cookie__" ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await parseResponse(r);
  if (!r.ok) throw new Error(data?.mensaje || data?._raw || "No autorizado");
  return data;
};

/** ACTUALIZAR PERFIL (nombre, avatar URL, etc.) */
export const updatePerfil = (payload) => async (dispatch, getState) => {
  dispatch({ type: AUTH_UPDATE_PROFILE_REQUEST });
  try {
    const token = getState().auth.token;
    const r = await fetch(`${API_USUARIOS}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && token !== "__cookie__" ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(payload), // { nombre?, avatar? }
    });
    const data = await parseResponse(r);
    if (!r.ok) throw new Error(data?.mensaje || data?._raw || "No se pudo actualizar");
    dispatch({ type: AUTH_UPDATE_PROFILE_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: AUTH_UPDATE_PROFILE_FAILURE, payload: e.message });
  }
};

/** ACTUALIZAR AVATAR (archivo) */
export const updateAvatar = (file) => async (dispatch, getState) => {
  dispatch({ type: AUTH_UPDATE_PROFILE_REQUEST });
  try {
    const token = getState().auth.token;
    const fd = new FormData();
    fd.append("avatar", file);
    const r = await fetch(`${API_USUARIOS}/me/avatar`, {
      method: "PUT",
      headers: token && token !== "__cookie__" ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
      body: fd,
    });
    const data = await parseResponse(r);
    if (!r.ok) throw new Error(data?.mensaje || data?._raw || "No se pudo actualizar imagen");
    dispatch({ type: AUTH_UPDATE_PROFILE_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: AUTH_UPDATE_PROFILE_FAILURE, payload: e.message });
  }
};


export const loginWithGoogle = (idToken, keep=false) => async (dispatch) => {
  dispatch({ type: AUTH_LOGIN_REQUEST });
  try {
    const r = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });
    const data = await parseResponse(r);
    if (!r.ok) throw new Error(data?.mensaje || data?._raw || "No se pudo iniciar sesión con Google");

    const token = data?.accessToken || data?.token || null;
    if (token) (keep ? localStorage : sessionStorage).setItem("token", token);

    dispatch({
      type: AUTH_LOGIN_SUCCESS,
      payload: { token: token || "__cookie__", usuario: data?.usuario, roles: data?.roles || [] },
    });

    // si no vino usuario completo, hidratar
    try {
      const perfil = await fetch(`${API_USUARIOS}/me`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(parseResponse);
      if (!perfil?._raw) dispatch({ type: AUTH_PERFIL_SUCCESS, payload: perfil });
    } catch {}
  } catch (e) {
    dispatch({ type: AUTH_LOGIN_FAILURE, payload: e.message });
  }
};
