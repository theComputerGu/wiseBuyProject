import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShoppingListItem {
    _id: string; // product id
    quantity: number;
}

export interface ShoppingList {
    _id: string;
    items: ShoppingListItem[];
    total?: number;
}

export interface ShoppingListState {
    activeList: ShoppingList | null;
    isLoading: boolean;
}

const initialState: ShoppingListState = {
    activeList: null,
    isLoading: false,
};

export const shoppingListSlice = createSlice({
    name: 'shoppingList',
    initialState,
    reducers: {
        setActiveList: (s, a: PayloadAction<ShoppingList>) => {
            s.activeList = a.payload;
        },

        addItemLocal: (s, a: PayloadAction<{ productId: string }>) => {
            if (!s.activeList) return;

            const { productId } = a.payload;
            const existing = s.activeList.items.find(i => i._id === productId);

            if (existing) {
                existing.quantity += 1;
            } else {
                s.activeList.items.push({
                    _id: productId,
                    quantity: 1,
                });
            }
        },

        removeItemLocal: (s, a: PayloadAction<{ productId: string }>) => {
            if (!s.activeList) return;

            const { productId } = a.payload;
            const existing = s.activeList.items.find(i => i._id === productId);

            if (existing) {
                if (existing.quantity > 1) {
                    existing.quantity -= 1;
                } else {
                    s.activeList.items = s.activeList.items.filter(i => i._id !== productId);
                }
            }
        },

        updateItem: (
            s,
            a: PayloadAction<{ productId: string; patch: Partial<ShoppingListItem> }>
        ) => {
            if (!s.activeList) return;
            const item = s.activeList.items.find(i => i._id === a.payload.productId);
            if (item) Object.assign(item, a.payload.patch);
        },
    },
});

export const { setActiveList, addItemLocal, removeItemLocal, updateItem } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
