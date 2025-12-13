import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ======================================================
   TYPES — MATCH NESTJS BACKEND SCHEMA 1:1
====================================================== */

export type GeoPoint = {
    lat: number;
    lon: number;
};

export type StoreOffer = {
    chain: string;          // "Shufersal", "Rami Levy"
    address: string;        // full address
    price: number;          // price in ILS
    geo?: GeoPoint;         // optional
    lastUpdated?: string;    // Date serialized as ISO string
};

export type StoresEntry = {
    itemcode: string;       // barcode
    stores: StoreOffer[];
};

/* ======================================================
   STATE
====================================================== */

export type StoresState = {
    stores: Record<string, StoresEntry>; // key = itemcode
    signature: string | null;
};

const initialState: StoresState = {
    stores: {},
    signature: null,
};

/* ======================================================
   SLICE
====================================================== */

const storesSlice = createSlice({
    name: "stores",
    initialState,
    reducers: {
        // 1️⃣ Clear everything
        clearStores(state) {
            state.stores = {};
        },

        // 2️⃣ Replace entire store object
        setStores(
            state,
            action: PayloadAction<Record<string, StoresEntry>>
        ) {
            state.stores = action.payload;
        },

        setSignature(state, action: PayloadAction<string>) {
            state.signature = action.payload;
        },

        // 3️⃣ Append / upsert single StoresEntry
        appendStores(state, action: PayloadAction<StoresEntry>) {
            const entry = action.payload;
            state.stores[entry.itemcode] = entry;
        },
    },
});

/* ======================================================
   ACTIONS
====================================================== */

export const {
    clearStores,
    setStores,
    appendStores,
    setSignature,
} = storesSlice.actions;

/* ======================================================
   REDUCER
====================================================== */

export default storesSlice.reducer;
