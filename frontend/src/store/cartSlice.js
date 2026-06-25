import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        total: 0,
    },
    reducers: {
        addToCart: (state, action) => {
            const produs = action.payload;
            const existingItem = state.items.find(item => item.id_produs === produs.id_produs);

            if(existingItem) {
                existingItem.cantitate += 1;
            } else {
                state.items.push({ ...produs, cantitate: 1 });
            }
            state.total += produs.pret;
        },
        removeFromCart: (state, action) => {
            const id_produs = action.payload;
            const existingItem = state.items.find(item => item.id_produs === id_produs);

            if(existingItem) {
                state.total -= existingItem.pret * existingItem.cantitate;
                state.items = state.items.filter(item => item.id_produs !== id_produs);
            }
        },

        clearCart: (state) => {
            state.items = [];
            state.total = 0;
        }
    }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;