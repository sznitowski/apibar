import {
  FETCH_MESAS_LOADING,
  FETCH_MESAS_SUCCESS,
  FETCH_MESAS_ERROR,
  //FETCH_MESAS_ESTADO_LOADING,
  //FETCH_MESAS_ESTADO_SUCCESS,
  //FETCH_MESAS_ESTADO_ERROR,
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
} from "./types";

const url = "http://localhost:5000/";

export const fetchMesas = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_MESAS_LOADING });
    const response = await fetch(`${url}api/mesas`);
    const data = await response.json();
    console.log(response);
    console.log(data);
    dispatch({ type: FETCH_MESAS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error fetching mesas:", error);
    dispatch({ type: FETCH_MESAS_ERROR, payload: error.message });
  }
};

export const fetchMesasConsumo = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_MESAS_CONSUMO_LOADING });
    const response = await fetch(`${url}api/consumo`);
    const data = await response.json();
    console.log("Datos obtenidos de mesasestado:", data); // Verifica que los datos sean correctos
    dispatch({ type: FETCH_MESAS_CONSUMO_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error fetching mesasestado:", error);
    dispatch({ type: FETCH_MESAS_CONSUMO_ERROR, payload: error.message });
  }
};

// Acción para crear una nueva mesa
export const createMesa = (mesaData) => async (dispatch) => {
  dispatch({ type: CREATE_MESA_REQUEST });
  try {
    const response = await fetch("/api/mesas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mesaData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const newMesa = await response.json();
    dispatch({ type: CREATE_MESA_SUCCESS, payload: newMesa });
  } catch (error) {
    dispatch({ type: CREATE_MESA_FAILURE, payload: error.message });
  }
};

export const updateMesa = (id, mesaData) => async (dispatch) => {
  if (!id) return; // ⛔️ Evitás llamadas rotas

  try {
    const response = await fetch(`${url}api/mesas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mesaData),
    });
    const data = await response.json();
    dispatch({ type: UPDATE_MESA, payload: data });
  } catch (error) {
    console.error("Error updating mesa:", error);
  }
};

export const deleteMesa = (id) => async (dispatch) => {
  try {
    await fetch(`${url}api/mesas/${id}`, {
      method: "DELETE",
    });
    dispatch({ type: DELETE_MESA, payload: id });
  } catch (error) {
    console.error("Error deleting mesa:", error);
  }
};

// Acción para asignar productos a una mesa usando fetch
export const assignProductsToMesa =
  (mesaId, productIds) => async (dispatch) => {
    try {
      const response = await fetch(`/api/mesas/${mesaId}/assign-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds }), // Se envía el cuerpo como JSON
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json(); // Asumimos que la respuesta es JSON

      dispatch({
        type: ASSIGN_PRODUCTS_TO_MESA,
        payload: { mesaId, productIds },
      });
    } catch (error) {
      console.error("Error assigning products to mesa:", error.message);
    }
  };

// TYPES PARA MANEJAR LOS DATOS TEMPORALES DE CONSUMO
export const setTempMesaData = (mesaId, data) => ({
  type: SET_TEMP_MESA_DATA,
  payload: { mesaId, data },
});

export const clearTempMesaData = (mesaId) => ({
  type: CLEAR_TEMP_MESA_DATA,
  payload: mesaId,
});

export const setAllTempMesaData = (data) => ({
  type: SET_ALL_TEMP_MESA_DATA,
  payload: data,
});
