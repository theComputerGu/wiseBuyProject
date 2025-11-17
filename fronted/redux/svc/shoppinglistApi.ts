import { baseApi } from "./baseApi";

export const shoppingListsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShoppingLists: builder.query<any[], any>({
      query: (params) => ({ url: "/shopping-lists", params }),
      providesTags: [{ type: "ShoppingLists", id: "LIST" }],
    }),

    getShoppingListById: builder.query<any, string>({
      query: (id) => `/shopping-lists/${id}`,
      providesTags: (_, __, id) => [{ type: "ShoppingLists", id }],
    }),

    createShoppingList: builder.mutation<any, any>({
      query: (body) => ({
        url: "/shopping-lists",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ShoppingLists", id: "LIST" }],
    }),

    updateShoppingList: builder.mutation<any, any>({
      query: ({ id, patch }) => ({
        url: `/shopping-lists/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: [{ type: "ShoppingLists", id: "LIST" }],
    }),
  }),
});

export const {
  useGetShoppingListsQuery,
  useGetShoppingListByIdQuery,
  useCreateShoppingListMutation,
  useUpdateShoppingListMutation,
} = shoppingListsApi;
