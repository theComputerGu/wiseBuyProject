import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* =========================
   Types
========================= */

export type Recommendation = {
  productId: string;
  itemcode: string;
  title: string;
  category?: string;
  image?: string;      
  pricerange?: string;   
  brand?: string;
  score: number;
  reason: string;
};

/* =========================
   State
========================= */

type RecommendedState = {
  items: Recommendation[];
};

const initialState: RecommendedState = {
  items: [],
};

/* =========================
   Slice
========================= */

const recommendedSlice = createSlice({
  name: "recommended",
  initialState,
  reducers: {
    setRecommendations(
      state,
      action: PayloadAction<Recommendation[]>
    ) {
      state.items = action.payload;
    },

    clearRecommendations(state) {
      state.items = [];
    },
  },
});

export const {
  setRecommendations,
  clearRecommendations,
} = recommendedSlice.actions;

export default recommendedSlice.reducer;
