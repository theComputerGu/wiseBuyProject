import { baseApi } from "./baseApi";

export interface Product {
    _id: string;
    title: string;
    brand?: string;
    unit?: "unit" | "kg" | "gram" | "liter";
    pricerange?: string;
    image?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}


export const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // GET /products?q=milk&category=dairy&brand=Tnuva
        getProducts: builder.query<
            Product[],
            { q?: string; category?: string; brand?: string }
        >({
            query: (params) => ({
                url: "/products",
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((p) => ({ type: "Products" as const, id: p._id })),
                        { type: "Products", id: "LIST" },
                    ]
                    : [{ type: "Products", id: "LIST" }],
        }),

        // GET /products/:id
        getProductById: builder.query<Product, string>({
            query: (id) => `/products/${id}`,
            providesTags: (_, __, id) => [{ type: "Products", id }],
        }),

        // POST /products
        createProduct: builder.mutation<Product, Partial<Product>>({
            query: (body) => ({
                url: "/products",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        }),

        // PATCH /products/:id
        updateProduct: builder.mutation<
            Product,
            { id: string; patch: Partial<Product> }
        >({
            query: ({ id, patch }) => ({
                url: `/products/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: (_, __, arg) => [
                { type: "Products", id: arg.id },
                { type: "Products", id: "LIST" },
            ],
        }),

        // DELETE /products/:id
        deleteProduct: builder.mutation<{ deleted: boolean }, string>({
            query: (id) => ({
                url: `/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        }),

    }),
});

// Hooks export
export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productsApi;
