import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { storeApi, StoreOffer } from "../svc/storeApi";

type StoresState = {
    byItemcode: Record<string, StoreOffer[]>;
};

const initialState: StoresState = {
    byItemcode: {},
};

const storesSlice = createSlice({
    name: "stores",
    initialState,
    reducers: {
        clearStores(state) {
            state.byItemcode = {};
        },
    },
    extraReducers: builder => {
        builder.addMatcher(
            storeApi.endpoints.getStoresBulk.matchFulfilled,
            (state, action) => {
                for (const doc of action.payload) {
                    state.byItemcode[doc.itemcode] = doc.stores;
                }
            }
        );
    }
});

export const { clearStores } = storesSlice.actions;
export default storesSlice.reducer;
