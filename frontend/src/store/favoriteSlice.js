import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: localStorage.getItem('favoriteItems') 
         ? JSON.parse(localStorage.getItem('favoriteItems')) 
         : [],
};

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const produs = action.payload;
      const index = state.items.findIndex(item => item.id_produs === produs.id_produs);
      
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(produs);
      }
      localStorage.setItem('favoriteItems', JSON.stringify(state.items));
    },
  },
});

export const { toggleFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;