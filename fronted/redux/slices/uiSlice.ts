import { createSlice, PayloadAction } from '@reduxjs/toolkit';
/*
note: slice for ui
*/

type Filters = { q?: string; category?: string; storeId?: string;
  priceRange?: [number, number]; sort?: 'price-asc' | 'price-desc' | 'rating' | 'new' };

interface UiState { filters: Filters; recentSearches: string[] }

const initialState: UiState = {
  filters: { q: '', category: undefined, storeId: undefined, priceRange: undefined, sort: 'price-asc' },
  recentSearches: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFilters: (s, a: PayloadAction<Partial<Filters>>) => { s.filters = { ...s.filters, ...a.payload }; },
    pushSearch: (s, a: PayloadAction<string>) => {
      const q = a.payload;
      s.filters.q = q;
      s.recentSearches = [q, ...s.recentSearches.filter(x => x !== q)].slice(0, 10);
    },
    clearFilters: (s) => { s.filters = initialState.filters; },
  },
});

export const { setFilters, pushSearch, clearFilters } = uiSlice.actions;
export default uiSlice.reducer;                 
