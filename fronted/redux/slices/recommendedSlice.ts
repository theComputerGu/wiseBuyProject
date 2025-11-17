import { createSlice, PayloadAction } from "@reduxjs/toolkit";
/*
note: contain a list of about 100 products reccomneded from the server
usefull for saving a small local state istead of pulling data from the server endlessley
*/

//
// TYPES
//
export interface RecommendedItem {
  _id : any
  itemcode?: string;
  title: string;
  unit?: "unit" | "kg" | "gram" | "liter";
  brand?: string;
  pricerange?: string;
  image?: string;
  category?: string;
}

export interface RecommendedState {
  items: RecommendedItem[];
  isLoading: boolean;
}

//
// INITIAL STATE
//
const initialState: RecommendedState = {
  items: [],
  isLoading: false,
};

//
// SLICE
//
export const recommendedSlice = createSlice({
  name: "recommended",
  initialState,
  reducers: {
    setRecommendations: (s, a: PayloadAction<RecommendedItem[]>) => {
      s.items = a.payload;
    },

    addRecommendation: (s, a: PayloadAction<RecommendedItem>) => {
      s.items.push(a.payload);
    },

    removeRecommendation: (s, a: PayloadAction<any>) => {
      s.items = s.items.filter((item) => item._id !== a.payload);
    },

    clearRecommendations: (s) => {
      s.items = [];
    },

    setRecommendedLoading: (s, a: PayloadAction<boolean>) => {
      s.isLoading = a.payload;
    },

  },
});

export const {
  setRecommendations,
  addRecommendation,
  removeRecommendation,
  clearRecommendations,
  setRecommendedLoading,
} = recommendedSlice.actions;

export default recommendedSlice.reducer;
