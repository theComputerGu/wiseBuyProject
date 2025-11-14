import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@env';


const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state: any = getState();
    const token = state?.auth?.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});



export interface Product {
  _id: string;
  title: string;
  brand?: string;
  price: number;
  currency?: string;
  images?: string[];
  inStock?: boolean;
  category?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Store {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  type?: 'Point';
  coordinates?: [number, number];
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMember {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Group {
  _id: string;
  name: string;
  admin?: string | GroupMember;
  adminId?: string;
  users: GroupMember[];
  groupcode: string;
  shoppingList: {
    productName: string;
    quantity: number;
    price: number;
    checked: boolean;
  }[];

  history: {
    purchasedAt: string;
    items: { productName: string; quantity: number; price: number }[];
  }[];

  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  groups: string[];                 
  defaultGroupId?: string | null|  undefined;     
  createdAt?: string;
  updatedAt?: string;
}

export type ShoppingListItem = {
  productId: string;
  nameSnapshot?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  lineTotal: number;
  notes?: string;
};

export interface ShoppingList {
  _id: string;
  groupId: string;
  userId: string;
  storeId?: string;
  purchasedAt: string;
  items: ShoppingListItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  notes?: string;
  receiptImages?: string[];
  status: 'draft' | 'final';
  createdAt?: string;
  updatedAt?: string;
}

export type QueryShoppingList = {
  groupId?: string;
  userId?: string;
  storeId?: string;
  from?: string;
  to?: string;
  status?: 'draft' | 'final';
};



export const wisebuyApi = createApi({
  reducerPath: 'wisebuyApi',
  baseQuery,
  tagTypes: ['Products', 'Stores', 'ShoppingLists', 'Groups', 'Users'],
  endpoints: (builder) => ({

    // ===== PRODUCTS =====
    getProducts: builder.query<
      Product[] | { items: Product[]; nextCursor?: string | null },
      {
        q?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
        limit?: number;
        cursor?: string;
      }
    >({
      query: (params) => ({ url: '/products', params }),
      providesTags: (result) => {
        const items = Array.isArray(result) ? result : result?.items ?? [];
        return [
          ...(items as Product[]).map((p) => ({
            type: 'Products' as const,
            id: p._id,
          })),
          { type: 'Products' as const, id: 'LIST' },
        ];
      },
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Products', id }],
    }),

    getRecommendations: builder.query<Product[], void>({
      query: () => `/products/recommendations`,
      providesTags: [{ type: 'Products', id: 'RECS' }],
    }),

    // ===== STORES =====
    getStores: builder.query<Store[], void>({
      query: () => `/stores`,
      providesTags: [{ type: 'Stores', id: 'LIST' }],
    }),

    getStoreById: builder.query<Store, string>({
      query: (id) => `/stores/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Stores', id }],
    }),

    getNearbyStores: builder.query<
      Store[],
      { lat: number; lng: number; maxDistance?: number }
    >({
      query: (p) => ({ url: '/stores/nearby', params: p }),
      providesTags: [{ type: 'Stores', id: 'NEARBY' }],
    }),

    createStore: builder.mutation<
      Store,
      { name: string; address?: string; city?: string; lat: number; lng: number }
    >({
      query: (body) => ({ url: '/stores', method: 'POST', body }),
      invalidatesTags: [{ type: 'Stores', id: 'LIST' }],
    }),

    deleteStore: builder.mutation<{ deleted: true } | Store | null, string>({
      query: (id) => ({ url: `/stores/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Stores', id: 'LIST' }],
    }),

    // ===== SHOPPING LISTS =====
    getShoppingLists: builder.query<ShoppingList[], QueryShoppingList>({
      query: (params) => ({ url: '/shopping-lists', params }),
      providesTags: [{ type: 'ShoppingLists', id: 'LIST' }],
    }),

    getShoppingListById: builder.query<ShoppingList, string>({
      query: (id) => `/shopping-lists/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'ShoppingLists', id }],
    }),

    createShoppingList: builder.mutation<ShoppingList, Partial<ShoppingList>>({
      query: (body) => ({ url: '/shopping-lists', method: 'POST', body }),
      invalidatesTags: [{ type: 'ShoppingLists', id: 'LIST' }],
    }),

    updateShoppingList: builder.mutation<
      ShoppingList,
      { id: string; patch: Partial<ShoppingList> }
    >({
      query: ({ id, patch }) => ({
        url: `/shopping-lists/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'ShoppingLists', id: arg.id },
        { type: 'ShoppingLists', id: 'LIST' },
      ],
    }),

    deleteShoppingList: builder.mutation<{ deleted: true } | any, string>({
      query: (id) => ({
        url: `/shopping-lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ShoppingLists', id: 'LIST' }],
    }),

    addShoppingItem: builder.mutation<
      ShoppingList,
      {
        id: string;
        item: Omit<ShoppingListItem, 'lineTotal' | 'unit'> & {
          unit?: string;
          lineTotal?: number;
        };
      }
    >({
      query: ({ id, item }) => ({
        url: `/shopping-lists/${id}/items`,
        method: 'POST',
        body: item,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'ShoppingLists', id: arg.id },
      ],
    }),

    updateShoppingItem: builder.mutation<
      ShoppingList,
      { id: string; idx: number; patch: Partial<ShoppingListItem> }
    >({
      query: ({ id, idx, patch }) => ({
        url: `/shopping-lists/${id}/items/${idx}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'ShoppingLists', id: arg.id },
      ],
    }),

    removeShoppingItem: builder.mutation<
      ShoppingList,
      { id: string; idx: number }
    >({
      query: ({ id, idx }) => ({
        url: `/shopping-lists/${id}/items/${idx}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'ShoppingLists', id: arg.id },
      ],
    }),

    getMonthlyStats: builder.query<
      Array<{ _id: { y: number; m: number }; total: number; count: number }>,
      { groupId: string; storeId?: string }
    >({
      query: (params) => ({
        url: `/shopping-lists/stats/monthly`,
        params,
      }),
      providesTags: [{ type: 'ShoppingLists', id: 'STATS' }],
    }),

    // ===== GROUPS =====

    createGroup: builder.mutation<Group, { name: string; adminId: string }>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Groups', id: 'LIST' }],
    }),

    getGroups: builder.query<Group[], void>({
      query: () => '/groups',
      providesTags: [{ type: 'Groups', id: 'LIST' }],
    }),

    getGroupById: builder.query<Group, string>({
      query: (id) => `/groups/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Groups', id }],
    }),

    getGroupByCode: builder.query<Group, string>({
      query: (code) => `/groups/code/${code}`,
      providesTags: (_r, _e, code) => [
        { type: 'Groups', id: `code:${code}` },
      ],
    }),

    getGroupUsers: builder.query<GroupMember[], string>({
      query: (id) => `/groups/${id}/users`,
      providesTags: (_r, _e, id) => [{ type: 'Groups', id }],
    }),

    addUserToGroup: builder.mutation<Group, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/add-user`,
        method: 'PATCH',
        body: { userId },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Users', id: arg.userId },
        { type: 'Groups', id: arg.id },
        { type: 'Groups', id: 'LIST' },
      ],
    }),


    removeUserFromGroup: builder.mutation<Group, { id: string; userId: string }>(
      {
        query: ({ id, userId }) => ({
          url: `/groups/${id}/remove-user`,
          method: 'PATCH',
          body: { userId },
        }),
        invalidatesTags: (_r, _e, arg) => [
          { type: 'Users', id: arg.userId },
          { type: 'Groups', id: arg.id },
          { type: 'Groups', id: 'LIST' },
        ],
      }
    ),

    deleteGroup: builder.mutation<any, { id: string; requesterId: string }>({
      query: ({ id, requesterId }) => ({
        url: `/groups/${id}`,
        method: 'DELETE',
        body: { requesterId },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Groups", id: arg.id },        // מוחק קבוצה ספציפית
        { type: "Groups", id: "LIST" },        // מרענן רשימת קבוצות
        { type: "Users", id: arg.requesterId },// 🔥 הכי חשוב — מרענן את המשתמש
        { type: "Users", id: "LIST" },         // מרענן כל המשתמשים
      ],
    }),



    // ===== USERS =====
    removeGroupFromUser: builder.mutation<any, { userId: string; groupId: string }>(
      {
        query: ({ userId, groupId }) => ({
          url: `/users/${userId}/remove-group/${groupId}`,
          method: 'PATCH',
        }),
        invalidatesTags: (_r, _e, arg) => [
          { type: 'Users', id: arg.userId },
          { type: 'Groups', id: arg.groupId },
        ],
      }
    ),


    uploadAvatar: builder.mutation<any, { id: string; file: any }>({
      query: ({ id, file }) => {
        const form = new FormData();
        form.append('file', file as any);

        return {
          url: `/users/${id}/avatar`,
          method: 'PATCH',
          body: form,
        };
      },
    }),

    deleteUser: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
    }),

    updateUser: builder.mutation<User, { id: string; patch: Partial<User> }>({
      query: ({ id, patch }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Users', id: arg.id },
        { type: 'Users', id: 'LIST' },
      ],
    }),

    createUser: builder.mutation<User, { name: string; email: string; password: string }>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
    }),

    addGroupToUser: builder.mutation<User, { userId: string; groupId: string }>(
      {
        query: ({ userId, groupId }) => ({
          url: `/users/${userId}/add-group/${groupId}`,
          method: 'PATCH',
        }),
        invalidatesTags: (_r, _e, arg) => [
          { type: 'Users', id: arg.userId },
          { type: 'Groups', id: arg.groupId },
        ],
      }
    ),

    getUserGroups: builder.query<Group[], string>({
      query: (id) => `/users/${id}/groups`,
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
    }),

    // ===== AUTH (Login) =====
    login: builder.mutation<
  User,
  { email: string; password: string }
  >({
      query: (body) => ({ url: '/users/login', method: 'POST', body }),
    }),
  }),
});

// ---------- Hooks ----------
export const {
  // products
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetRecommendationsQuery,

  // stores
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useGetNearbyStoresQuery,
  useCreateStoreMutation,
  useDeleteStoreMutation,

  // shopping-lists
  useGetShoppingListsQuery,
  useGetShoppingListByIdQuery,
  useCreateShoppingListMutation,
  useUpdateShoppingListMutation,
  useDeleteShoppingListMutation,
  useAddShoppingItemMutation,
  useUpdateShoppingItemMutation,
  useRemoveShoppingItemMutation,
  useGetMonthlyStatsQuery,

  // groups
  useCreateGroupMutation,
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useGetGroupByCodeQuery,
  useGetGroupUsersQuery,
  useAddUserToGroupMutation,
  useRemoveUserFromGroupMutation,
  useLazyGetGroupByCodeQuery,
  useDeleteGroupMutation,

  // users
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddGroupToUserMutation,
  useGetUserGroupsQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUploadAvatarMutation,
  useRemoveGroupFromUserMutation,

  // auth
  useLoginMutation,
} = wisebuyApi;
