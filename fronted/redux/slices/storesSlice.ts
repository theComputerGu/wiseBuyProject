import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ScoredStore, StoresEntry } from "../../types/Store";
export type StoresState = {stores: Record<string, StoresEntry>;scoredStores: ScoredStore[]; signature: string | null;};



const initialState: StoresState = {stores: {},scoredStores: [],signature: null,};


const storesSlice = createSlice({name: "stores",initialState,reducers: {

    clearStores(state) {
      state.stores = {};
      state.scoredStores = []; 
      state.signature = null;
    },

    appendStores(state, action: PayloadAction<StoresEntry>) {
      state.stores[action.payload.itemcode] = action.payload;
    },

    setScoredStores(
      state,
      action: PayloadAction<ScoredStore[]>
    ) {
      state.scoredStores = action.payload;
    },

    setSignature(state, action: PayloadAction<string>) {
      state.signature = action.payload;
    },
  },
});

export const {
  clearStores,
  appendStores,
  setScoredStores,
  setSignature,
} = storesSlice.actions;

export default storesSlice.reducer;
