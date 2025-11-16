import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface activeshoppinglist {
  activeListId: string | null;
  activePurchaseNumber: number | null;
}

const initialState: activeshoppinglist = {
  activeListId: null,
  activePurchaseNumber: null,
};

const activeshoppinglistSlice = createSlice({
  name: "activeshoppinglist",
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

export const { setActiveList, clearActiveList } = activeshoppinglistSlice.actions;
export default activeshoppinglistSlice.reducer;
