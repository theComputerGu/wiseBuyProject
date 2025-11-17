import { baseApi } from "./baseApi";

export interface Store {
  _id: string;
  name: string;
  city?: string;
  coordinates?: number[];
}

export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<Store[], void>({
      query: () => "/stores",
      providesTags: [{ type: "Stores", id: "LIST" }],
    }),

    getStoreById: builder.query<Store, string>({
      query: (id) => `/stores/${id}`,
      providesTags: (_, __, id) => [{ type: "Stores", id }],
    }),

    getNearbyStores: builder.query<
      Store[],
      { lat: number; lng: number; maxDistance?: number }
    >({
      query: (params) => ({ url: "/stores/nearby", params }),
      providesTags: [{ type: "Stores", id: "NEARBY" }],
    }),

    createStore: builder.mutation<any, any>({
      query: (body) => ({
        url: "/stores",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Stores", id: "LIST" }],
    }),

    deleteStore: builder.mutation<any, string>({
      query: (id) => ({
        url: `/stores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Stores", id: "LIST" }],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useGetNearbyStoresQuery,
  useCreateStoreMutation,
  useDeleteStoreMutation,
} = storesApi;
