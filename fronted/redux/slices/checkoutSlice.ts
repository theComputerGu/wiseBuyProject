import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
  radius: number;
  userLocation: { lat: number; lon: number } | null;
}

const initialState: CheckoutState = {
  radius: 3,
  userLocation: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setUserLocation(
      state,
      action: PayloadAction<{ lat: number; lon: number }>
    ) {
      state.userLocation = action.payload;
    },

    setRadius(state, action: PayloadAction<number>) {
      state.radius = action.payload;
    },
  },
});

export const { setUserLocation, setRadius } = checkoutSlice.actions;

export default checkoutSlice.reducer;
