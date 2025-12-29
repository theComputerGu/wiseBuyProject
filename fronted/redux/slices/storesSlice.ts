import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StoresEntry } from "../../types/Store";

export type StoresState = {
  stores: Record<string, StoresEntry>;
  signature: string | null;
};

const initialState: StoresState = {
  stores: {},
  signature: null,
};

const storesSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    clearStores(state) {
      state.stores = {};
      state.signature = null;
    },

    appendStores(state, action: PayloadAction<StoresEntry>) {
      state.stores[action.payload.itemcode] = action.payload;
    },

    setSignature(state, action: PayloadAction<string>) {
      state.signature = action.payload;
    },
  },
});

export const { clearStores, appendStores, setSignature } =
  storesSlice.actions;

export default storesSlice.reducer;
