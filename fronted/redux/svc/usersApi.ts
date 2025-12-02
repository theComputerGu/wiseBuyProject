import { baseApi } from "./baseApi";
import type {Group } from "../svc/groupsApi";


export interface User {
  _id: string;
  name: string;
  email: string;
  passwordLength?: number
  avatarUrl?: string | null;
  groups: string[];                 
  activeGroup?: string | null|  undefined;     
  createdAt?: string;
  updatedAt?: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation<
      User,
      { email: string; passwordPlain: string }
    >({
      query: (body) => ({
        url: "/users/login",
        method: "POST",
        body,
      }),
    }),

    setActiveGroup: builder.mutation<
  User,
  { userId: string; groupId: string }
>({
  query: ({ userId, groupId }) => ({
    url: `/users/${userId}/set-active-group`,
    method: "PATCH",
    body: { groupId },
  }),
  invalidatesTags: (_r, _e, arg) => [
    { type: "Users", id: arg.userId },
    { type: "Users", id: "LIST" },
  ],
}),


    createUser: builder.mutation<
      User,
      { name: string; email: string; passwordPlain: string }
    >({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Users", id }],
    }),

    updateUser: builder.mutation<
      User,
      { id: string; patch: Partial<User> }
    >({
      query: ({ id, patch }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Users", id: arg.id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
    }),

    uploadAvatar: builder.mutation<any, { id: string; file: any }>({
      query: ({ id, file }) => {
        const form = new FormData();
        form.append("file", file as any);

        return {
          url: `/users/${id}/avatar`,
          method: "PATCH",
          body: form,
        };
      },
    }),

    addGroupToUser: builder.mutation<
      User,
      { userId: string; groupId: string }
    >({
      query: ({ userId, groupId }) => ({
        url: `/users/${userId}/add-group/${groupId}`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Users", id: arg.userId },
        { type: "Groups", id: arg.groupId },
      ],
    }),

    removeGroupFromUser: builder.mutation<
      any,
      { userId: string; groupId: string }
    >({
      query: ({ userId, groupId }) => ({
        url: `/users/${userId}/remove-group/${groupId}`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Users", id: arg.userId },
        { type: "Groups", id: arg.groupId },
      ],
    }),

    getUserGroups: builder.query<Group[], string>({
      query: (id) => `/users/${id}/groups`,
      providesTags: (_r, _e, id) => [{ type: "Users", id }],
    }),

  }),
  
});




export const {
  useLoginMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadAvatarMutation,
  useAddGroupToUserMutation,
  useRemoveGroupFromUserMutation,
  useGetUserGroupsQuery,
  useSetActiveGroupMutation,
} = usersApi;
