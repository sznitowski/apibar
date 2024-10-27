import { GET_PRODUCTS_LOADING, GET_PRODUCTS_SUCCESS, GET_PRODUCTS_ERROR, ADD_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT } from "./types";

const initialState = {
  loading: false,
  error: null,
  products: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_PRODUCTS_LOADING:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case GET_PRODUCTS_SUCCESS:
            return {
                ...state,
                loading: false,
                products: action.payload,
            };
        case GET_PRODUCTS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case ADD_PRODUCT:
            return {
                ...state,
                products: [...state.products, action.payload],
            };
        case UPDATE_PRODUCT:
            return {
                ...state,
                products: state.products.map(product => 
                    product.id === action.payload.id ? action.payload : product
                ),
            };
        case DELETE_PRODUCT:
            return {
                ...state,
                products: state.products.filter(product => product.id !== action.payload),
            };
        default:
            return state;
    }
}
