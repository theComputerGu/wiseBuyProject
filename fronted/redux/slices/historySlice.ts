import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type CartItem = { productId: string; qty: number; price?: number; name?: string; unit?: string };
interface DraftState { items: CartItem[] }

const initialState: DraftState = { items: [] };

const historySlice = createSlice({
  name: 'historySlice',
  initialState,
  reducers: {
    addItem: (s, a: PayloadAction<CartItem>) => { s.items.push(a.payload); },
    updateItem: (s, a: PayloadAction<{ productId: string; patch: Partial<CartItem> }>) => {
      const i = s.items.findIndex(x => x.productId === a.payload.productId);
      if (i >= 0) s.items[i] = { ...s.items[i], ...a.payload.patch };
    },
    removeItem: (s, a: PayloadAction<string>) => { s.items = s.items.filter(x => x.productId !== a.payload); },
    clearDraft: (s) => { s.items = []; },
  },
});

export const { addItem, updateItem, removeItem, clearDraft } = historySlice.actions;
export default historySlice.reducer;         
