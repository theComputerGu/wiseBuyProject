import { baseApi } from "./baseApi";

export interface Product {
    _id: string;
    itemcode?: string;
    title: string;
    unit?: "unit" | "kg" | "gram" | "liter";
    brand?: string;
    pricerange?: string;
    image?: string;
    category?: string;
}


export const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

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
                        ...result.map((p) => ({ type: "Products" as const, id: p.itemcode })),
                        { type: "Products", id: "LIST" },
                    ]
                    : [{ type: "Products", id: "LIST" }],
        }),

        getProductById: builder.query<Product, string>({
            query: (id) => `/products/${id}`,
            providesTags: (_, __, id) => [{ type: "Products", id }],
        }),

        createProduct: builder.mutation<Product, Partial<Product>>({
            query: (body) => ({
                url: "/products",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        }),

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

        deleteProduct: builder.mutation<{ deleted: boolean }, string>({
            query: (id) => ({
                url: `/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        }),


         getProductByItemcode: builder.query<Product, string>({
            query: (itemcode) => `/products/itemcode/${itemcode}`,
            providesTags: (_, __, itemcode) => [
                { type: "Products", id: itemcode },
            ],
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
    useGetProductByItemcodeQuery,
} = productsApi;
