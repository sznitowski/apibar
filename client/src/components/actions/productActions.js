// productActions.js

import { GET_PRODUCTS, GET_PRODUCTS_ERROR, GET_PRODUCTS_SUCCESS, GET_PRODUCTS_LOADING,  ADD_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT } from "./types";


const url = 'http://localhost:5000/'


export const fetchProducts = () => async (dispatch) => {
    try {
        dispatch({ type: GET_PRODUCTS_LOADING }); // Dispatch loading action
        const response = await fetch(`${url}api/products`);
        const data = await response.json();
        console.log(response)
        console.log(data)
        dispatch({ type: GET_PRODUCTS_SUCCESS, payload: data }); // Dispatch success action with data
    } catch (error) {
        console.error("Error fetching products:", error);
        dispatch({ type: GET_PRODUCTS_ERROR, payload: error.message }); // Dispatch error action with error message
    }
};


export const createProduct = (productData) => async (dispatch) => {
    try {
        const response = await fetch(`${url}api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        const data = await response.json();
        dispatch({ type: ADD_PRODUCT, payload: data });
    } catch (error) {
        console.error("Error creating product:", error);
    }
};

export const updateProduct = (id, productData) => async (dispatch) => {
    try {
        const response = await fetch(`${url}api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        const data = await response.json();
        dispatch({ type: UPDATE_PRODUCT, payload: data });
    } catch (error) {
        console.error("Error updating product:", error);
    }
};

export const deleteProduct = (id) => async (dispatch) => {
    try {
        await fetch(`${url}api/products/${id}`, {
            method: 'DELETE',
        });
        dispatch({ type: DELETE_PRODUCT, payload: id });
    } catch (error) {
        console.error("Error deleting product:", error);
    }
};
