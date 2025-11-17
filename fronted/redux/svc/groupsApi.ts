import { baseApi } from "./baseApi";

export interface Group {
    _id: string;
    name: string;
    admin: string;
    users: string[];
    groupcode: string;
    activeshoppinglist: string;
    history: {
        name: string;
        shoppingListId?: string;
        purchasedAt: Date;
        storeId?: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}
export const groupsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // CREATE GROUP
        createGroup: builder.mutation<Group, { name: string; adminId: string }>({
            query: (body) => ({
                url: "/groups",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Groups", id: "LIST" }],
        }),

        // GET ALL GROUPS
        getGroups: builder.query<Group[], void>({
            query: () => "/groups",
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((g) => ({
                            type: "Groups" as const,
                            id: g._id,
                        })),
                        { type: "Groups" as const, id: "LIST" },
                    ]
                    : [{ type: "Groups" as const, id: "LIST" }],
        }),

        // GET GROUP BY ID
        getGroupById: builder.query<Group, string>({
            query: (id) => `/groups/${id}`,
            providesTags: (_, __, id) => [{ type: "Groups", id }],
        }),

        // GET GROUP BY CODE
        getGroupByCode: builder.query<Group, string>({
            query: (code) => `/groups/code/${code}`,
            providesTags: (_, __, code) => [{ type: "Groups", id: `code-${code}` }],
        }),

        // GET USERS OF GROUP
        getGroupUsers: builder.query<any[], string>({
            query: (groupId) => `/groups/${groupId}/users`,
            providesTags: (_, __, groupId) => [{ type: "Groups", id: groupId }],
        }),

        // ADD USER TO GROUP
        addUserToGroup: builder.mutation<Group, { groupId: string; userId: string }>({
            query: ({ groupId, userId }) => ({
                url: `/groups/${groupId}/add-user`,
                method: "PATCH",
                body: { userId },
            }),
            invalidatesTags: (_, __, { groupId }) => [{ type: "Groups", id: groupId }],
        }),

        // REMOVE USER FROM GROUP
        removeUserFromGroup: builder.mutation<Group, { groupId: string; userId: string }>({
            query: ({ groupId, userId }) => ({
                url: `/groups/${groupId}/remove-user`,
                method: "PATCH",
                body: { userId },
            }),
            invalidatesTags: (_, __, { groupId }) => [{ type: "Groups", id: groupId }],
        }),

        // DELETE GROUP
        deleteGroup: builder.mutation<Group, { id: string; requesterId: string }>({
            query: ({ id, requesterId }) => ({
                url: `/groups/${id}`,
                method: "DELETE",
                body: { requesterId },
            }),
            invalidatesTags: [{ type: "Groups", id: "LIST" }],
        }),

        // SET ACTIVE SHOPPING LIST
        updateActiveList: builder.mutation<
            Group,
            { groupId: string; list: string | null }
        >({
            query: ({ groupId, list }) => ({
                url: `/groups/${groupId}/activeshoppinglist`,
                method: "PATCH",
                body: { list },
            }),
            invalidatesTags: (_, __, { groupId }) => [{ type: "Groups", id: groupId }],
        }),

        // GET ACTIVE SHOPPING LIST
        getActiveShoppingList: builder.query<any, string>({
            query: (groupId) => `/groups/${groupId}/activeshoppinglist`,
            providesTags: (_, __, groupId) => [
                { type: "Groups", id: `active-${groupId}` },
            ],
        }),

        // GET GROUP ADMIN
        getAdmin: builder.query<any, string>({
            query: (groupId) => `/groups/${groupId}/admin`,
            providesTags: (_, __, groupId) => [
                { type: "Groups", id: `admin-${groupId}` },
            ],
        }),

        // GET GROUP HISTORY
        getHistory: builder.query<any[], string>({
            query: (groupId) => `/groups/${groupId}/history`,
            providesTags: (_, __, groupId) => [
                { type: "Groups", id: `history-${groupId}` },
            ],
        }),

        // ADD ACTIVE SHOPPING LIST → HISTORY
        addToHistory: builder.mutation<
            any,
            { groupId: string; shoppingListId: string | null; name: string }
        >({
            query: ({ groupId, shoppingListId, name }) => ({
                url: `/groups/${groupId}/history`,
                method: "POST",
                body: { shoppingListId, name },
            }),
            invalidatesTags: (_, __, { groupId }) => [
                { type: "Groups", id: groupId },
                { type: "Groups", id: `history-${groupId}` },
            ],
        }),
    }),
});

export const {
    useCreateGroupMutation,
    useGetGroupsQuery,
    useGetGroupByIdQuery,
    useGetGroupByCodeQuery,
    useGetGroupUsersQuery,
    useAddUserToGroupMutation,
    useRemoveUserFromGroupMutation,
    useDeleteGroupMutation,
    useUpdateActiveListMutation,
    useGetActiveShoppingListQuery,
    useGetAdminQuery,
    useGetHistoryQuery,
    useAddToHistoryMutation,
} = groupsApi;