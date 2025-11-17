import { createSlice, PayloadAction } from '@reduxjs/toolkit';
/*
note: contain active shopping list with its products
*/

//
// TYPES
//
export interface ShoppingListItem {
    productId: string; // should contain the full proudct data not only the id
    quantity: number;
}

export interface ShoppingList {
    items: ShoppingListItem[];
    total?: number;
}

export interface ShoppingListState {
    activeList: ShoppingList | null;
    isLoading: boolean;
}

//
// INITIAL STATE
//
const initialState: ShoppingListState = {
    activeList: null,
    isLoading: false,
};

//
// SLICE
//
export const shoppingListSlice = createSlice({
    name: 'shoppingList',
    initialState,
    reducers: {
        setActiveList: (s, a: PayloadAction<ShoppingList>) => {
            s.activeList = a.payload;
        },

        addItem: (s, a: PayloadAction<ShoppingListItem>) => {
            s.activeList?.items.push(a.payload);
        },

        updateItem: (
            s,
            a: PayloadAction<{ productId: string; patch: Partial<ShoppingListItem> }>
        ) => {
            if (!s.activeList) return;
            const i = s.activeList.items.findIndex(
                (x) => x.productId === a.payload.productId
            );
            if (i >= 0)
                s.activeList.items[i] = {
                    ...s.activeList.items[i],
                    ...a.payload.patch,
                };
        },

        removeItem: (s, a: PayloadAction<string>) => {
            if (!s.activeList) return;
            s.activeList.items = s.activeList.items.filter(
                (i) => i.productId !== a.payload
            );
        },

        clearList: (s) => {
            if (s.activeList) s.activeList.items = [];
        },
    },
});

export const {
    setActiveList,
    addItem,
    updateItem,
    removeItem,
    clearList,
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;
