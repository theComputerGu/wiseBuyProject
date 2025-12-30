import { baseApi } from "./baseApi";
import { StoreOffer } from "../../types/Store";
import { ScoredStore } from "../../types/Store";



export type ResolveRequest = {addressKey: string;itemcodes: string[];};
export type ResolveResponseItem = {itemcode: string;stores: StoreOffer[];source: "cache" | "scrape";};
export type ResolveResponse = {items: ResolveResponseItem[];scoredStores: ScoredStore[];};


export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    resolveStores: builder.mutation<
      ResolveResponse,
      ResolveRequest
    >({
      query: (body) => ({
        url: "/stores/resolve",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useResolveStoresMutation,
} = storesApi;
