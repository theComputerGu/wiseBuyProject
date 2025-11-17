import { baseApi } from "./baseApi";

export interface StorePrice {
  _id: string;
  productId: string | any;
  storeId: string | any;
  price: number;
  updatedAtXml?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const storePricesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({


    addPrice: builder.mutation<
      StorePrice,
      { productId: string; storeId: string; price: number }
    >({
      query: (body) => ({
        url: `/store-prices`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "StorePrices", id: "LIST" }],
    }),


    updatePrice: builder.mutation<
      StorePrice,
      { id: string; price: number }
    >({
      query: ({ id, price }) => ({
        url: `/store-prices/${id}`,
        method: "PATCH",
        body: { price },
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "StorePrices", id: arg.id },
        { type: "StorePrices", id: "LIST" },
      ],
    }),


    getPricesForProduct: builder.query<StorePrice[], string>({
      query: (productId) => `/store-prices/product/${productId}`,
      providesTags: (result, _err, productId) =>
        result
          ? [
              ...result.map((p) => ({
                type: "StorePrices" as const,
                id: p._id,
              })),
              { type: "StorePrices", id: `product-${productId}` },
            ]
          : [{ type: "StorePrices", id: `product-${productId}` }],
    }),


    comparePrices: builder.query<
      { productId: string; prices: StorePrice[]; cheapest: StorePrice },
      string
    >({
      query: (productId) => `/store-prices/product/${productId}/compare`,
      providesTags: (_r, _e, productId) => [
        { type: "StorePrices", id: `compare-${productId}` },
      ],
    }),


    deletePrice: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({
        url: `/store-prices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "StorePrices", id: "LIST" }],
    }),

  }),
});


export const {
  useAddPriceMutation,
  useUpdatePriceMutation,
  useGetPricesForProductQuery,
  useComparePricesQuery,
  useDeletePriceMutation,
} = storePricesApi;
