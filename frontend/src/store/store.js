import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";
import favoriteReducer from "./favoriteSlice";

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        favorite: favoriteReducer,
    },
});