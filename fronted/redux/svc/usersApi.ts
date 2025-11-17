import { baseApi } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (body) => ({
        url: "/users/login",
        method: "POST",
        body,
      }),
    }),

    createUser: builder.mutation<any, any>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    getUsers: builder.query<any[], void>({
      query: () => "/users",
      providesTags: [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query<any, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_, __, id) => [{ type: "Users", id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
} = usersApi;
