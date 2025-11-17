import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveListState {
  activeListId: string | null;
}

const initialState: ActiveListState = {
  activeListId: null,
};

const activeListSlice = createSlice({
  name: 'activeShoppingList',
  initialState,
  reducers: {
    setActiveList: (state, action: PayloadAction<string | null>) => {
      state.activeListId = action.payload;
    },
  },
});

export const { setActiveList } = activeListSlice.actions;
export default activeListSlice.reducer;
