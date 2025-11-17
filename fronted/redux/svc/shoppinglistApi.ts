import { baseApi } from "./baseApi";

export interface ShoppingListItem {
  productId: string;
  quantity: number;
}

export interface ShoppingList {
  items: ShoppingListItem[];
  total?: number;
}

export const shoppingListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getShoppingLists: builder.query<ShoppingList[], void>({
      query: () => "/shopping-lists",
      providesTags: (result) =>
        result
          ? [
              ...result.map((l) => ({
                type: "ShoppingLists" as const,
                id: l._id,
              })),
              { type: "ShoppingLists", id: "LIST" },
            ]
          : [{ type: "ShoppingLists", id: "LIST" }],
    }),

    getShoppingListById: builder.query<ShoppingList, string>({
      query: (id) => `/shopping-lists/${id}`,
      providesTags: (_r, _e, id) => [{ type: "ShoppingLists", id }],
    }),

    createShoppingList: builder.mutation<
      ShoppingList,
      { items?: ShoppingListItem[]; total?: number }
    >({
      query: (body) => ({
        url: "/shopping-lists",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ShoppingLists", id: "LIST" }],
    }),

    updateShoppingList: builder.mutation<
      ShoppingList,
      { id: string; patch: Partial<ShoppingList> }
    >({
      query: ({ id, patch }) => ({
        url: `/shopping-lists/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "ShoppingLists", id: arg.id },
        { type: "ShoppingLists", id: "LIST" },
      ],
    }),

    deleteShoppingList: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({
        url: `/shopping-lists/${id}`,
        method: "DELETE",
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
  useDeleteShoppingListMutation,
} = shoppingListApi;
