import { baseApi } from "./baseApi";

export interface CHPStoreRow {
  name: string;
  branch: string;
  address: string;
  price: number;
}

export interface CHPStoresResponse {
  stores: string[][];
}

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoresForProduct: builder.query<
      CHPStoreRow[],
      { barcode: string; city: string }
    >({
      query: ({ barcode, city }) => {
        const encodedCity = encodeURIComponent(city);
        const url = `/scrape/stores/${barcode}/${encodedCity}`;

        console.log("🛰 RTK FETCH:", url);
        return url;
      },

      transformResponse: (res: CHPStoresResponse) => {
        console.log("🛰 RTK RESPONSE RAW:", res);

        if (!res?.stores) return [];

        return res.stores.map((row) => ({
          name: row[0],
          branch: row[1],
          address: row[2],
          price: parseFloat(row[4] || "0"),
        }));
      },
    }),
  }),
});

export const { useGetStoresForProductQuery, useLazyGetStoresForProductQuery } =
  storeApi;
