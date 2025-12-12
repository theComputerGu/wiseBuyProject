import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@env";

// --------------------
// Types
// --------------------
export type GeoPoint = {
  lat: number;
  lon: number;
};

export type StoreOffer = {
  chain: string;
  address: string;
  price: number;
  geo?: GeoPoint;   
};

export type ScrapeSuccess = {
  itemcode: string;
  stores: StoreOffer[];
};

export type ScrapeFailure = {
  itemcode: string;
  error: true;
};

export type ScrapeResult = ScrapeSuccess | ScrapeFailure;

export type StoresDoc = {
  itemcode: string;
  stores: StoreOffer[];
};

// --------------------
// API
// --------------------
export const storeApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),
  endpoints: builder => ({

    // 🔥 SCRAPE (side-effect only)
    scrapeStores: builder.mutation<
      ScrapeResult[],
      { barcodes: string[]; city: string }
    >({
      query: body => ({
        url: "/scrape/batch",
        method: "POST",
        body,
      }),
    }),

    // ✅ LOAD CACHE (THIS WAS MISSING)
    getStoresBulk: builder.mutation<
      StoresDoc[],
      { itemcodes: string[] }
    >({
      query: body => ({
        url: "/stores/bulk",
        method: "POST",
        body,
      }),
    }),

    // (optional, nice to have)
    getStoresByItemcode: builder.query<
      StoresDoc | null,
      string
    >({
      query: itemcode => `/stores?itemcode=${itemcode}`,
    }),
  }),
});

export const {
  useScrapeStoresMutation,
  useGetStoresBulkMutation,
  useGetStoresByItemcodeQuery,
} = storeApi;
