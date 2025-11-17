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
        getGroups: builder.query<any[], void>({
            query: () => "/groups",
            providesTags: [{ type: "Groups", id: "LIST" }],
        }),

        getGroupById: builder.query<any, string>({
            query: (id) => `/groups/${id}`,
            providesTags: (_, __, id) => [{ type: "Groups", id }],
        }),

        getGroupByCode: builder.query<any, string>({
            query: (code) => `/groups/code/${code}`,
            providesTags: (_, __, code) => [{ type: "Groups", id: `code:${code}` }],
        }),

        createGroup: builder.mutation<any, any>({
            query: (body) => ({ url: "/groups", method: "POST", body }),
            invalidatesTags: [{ type: "Groups", id: "LIST" }],
        }),

        deleteGroup: builder.mutation<any, any>({
            query: ({ id, requesterId }) => ({
                url: `/groups/${id}`,
                method: "DELETE",
                body: { requesterId },
            }),
            invalidatesTags: [{ type: "Groups", id: "LIST" }],
        }),
    }),
});

export const {
    useGetGroupsQuery,
    useGetGroupByIdQuery,
    useGetGroupByCodeQuery,
    useCreateGroupMutation,
    useDeleteGroupMutation,
} = groupsApi;
