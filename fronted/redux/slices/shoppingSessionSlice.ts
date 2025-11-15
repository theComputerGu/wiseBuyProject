import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ShoppingSessionState {
  activeListId: string | null;
  activePurchaseNumber: number | null;
}

const initialState: ShoppingSessionState = {
  activeListId: null,
  activePurchaseNumber: null,
};

const shoppingSessionSlice = createSlice({
  name: "shoppingSession",
  initialState,
  reducers: {
    setActiveList(state, action: PayloadAction<{ listId: string; purchaseNumber: number }>) {
      state.activeListId = action.payload.listId;
      state.activePurchaseNumber = action.payload.purchaseNumber;
    },

    clearActiveList(state) {
      state.activeListId = null;
      state.activePurchaseNumber = null;
    },
  },
});

export const { setActiveList, clearActiveList } = shoppingSessionSlice.actions;
export default shoppingSessionSlice.reducer;
