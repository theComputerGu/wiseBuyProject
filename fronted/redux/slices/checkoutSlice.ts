import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StoreEntry } from "../../types/Store";

interface CheckoutState {
  stores: StoreEntry[];
  radius: number;
  userLocation: { lat: number; lon: number } | null;
  updatedAt: number | null;
}

const initialState: CheckoutState = {
  stores: [],
  radius: 5,
  userLocation: null,
  updatedAt: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setStores(state, action: PayloadAction<StoreEntry[]>) {
      state.stores = action.payload;
      state.updatedAt = Date.now();
    },

    clearStores(state) {
      state.stores = [];
      state.updatedAt = null;
    },

    setUserLocation(state, action: PayloadAction<{ lat: number; lon: number }>) {
      state.userLocation = action.payload;
    },

    setRadius(state, action: PayloadAction<number>) {
      state.radius = action.payload;
    },
  },
});

export const { setStores, clearStores, setUserLocation, setRadius } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
