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
    // ---------------------------
    // 1. Create list
    // POST /shopping-lists
    // ---------------------------
    createList: builder.mutation({
      query: () => ({
        url: `/shopping-lists`,
        method: 'POST',
      }),
      invalidatesTags: ['ShoppingLists'],
    }),

    // ---------------------------
    // 2. Get all lists
    // GET /shopping-lists
    // ---------------------------
    getAllLists: builder.query({
      query: () => `/shopping-lists`,
      providesTags: ['ShoppingLists'],
    }),

    // ---------------------------
    // 3. Get list by ID
    // GET /shopping-lists/:id
    // ---------------------------
    getListById: builder.query({
      query: (id: string) => `/shopping-lists/${id}`,
      providesTags: (result, error, id) => [{ type: 'ShoppingLists', id }],
    }),

    // ---------------------------
    // 4. Add or increment item  
    // PATCH /shopping-lists/:id/items
    // Body: { productId }
    // ---------------------------
    addItem: builder.mutation({
      query: ({ listId, productId }) => ({
        url: `/shopping-lists/${listId}/items`,
        method: 'PATCH',
        body: { productId },
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: 'ShoppingLists', id: listId },
      ],
    }),

    // ---------------------------
    // 5. Remove or decrease item  
    // DELETE /shopping-lists/:id/items/:itemId
    // ---------------------------
    removeItem: builder.mutation({
      query: ({ listId, itemId }) => ({
        url: `/shopping-lists/${listId}/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: 'ShoppingLists', id: listId },
      ],
    }),

    // ---------------------------
    // 6. Delete entire list  
    // DELETE /shopping-lists/:id
    // ---------------------------
    deleteList: builder.mutation({
      query: (listId: string) => ({
        url: `/shopping-lists/${listId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShoppingLists'],
    }),
  }),
});

export const {
  useCreateListMutation,
  useGetAllListsQuery,
  useGetListByIdQuery,
  useAddItemMutation,
  useRemoveItemMutation,
  useDeleteListMutation,
} = shoppingListApi;

