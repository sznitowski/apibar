// src/components/reducers/authReducer.js
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

const tokenInicial =
  localStorage.getItem("token") || sessionStorage.getItem("token") || null;

const initialState = {
  token: tokenInicial,
  usuario: null,
  roles: [],
  loading: false,
  error: null,
  isAuthenticated: !!tokenInicial,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case AUTH_LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        token: action.payload.token || state.token,
        usuario: action.payload.usuario ?? state.usuario,
        roles: action.payload.roles ?? state.roles,
        isAuthenticated: true, // <-- clave
        error: null,
      };

    case AUTH_PERFIL_SUCCESS:
      return { ...state, usuario: action.payload, error: null };

    case AUTH_LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case AUTH_CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_LOGOUT:
      return {
        token: null,
        usuario: null,
        roles: [],
        loading: false,
        error: null,
        isAuthenticated: false,
      };

    case AUTH_UPDATE_PROFILE_REQUEST:
      return { ...state, loading: true };
    case AUTH_UPDATE_PROFILE_SUCCESS:
      return { ...state, loading: false, usuario: action.payload, error: null };
    case AUTH_UPDATE_PROFILE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
