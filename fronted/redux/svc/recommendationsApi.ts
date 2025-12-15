import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@env";

/* =========================
   Types
========================= */

export type Recommendation = {
    productId: string;
    itemcode: string;
    title: string;
    category?: string;
    brand?: string;
    image?: string;
    pricerange?: string;
    score: number;
    reason: string;
};

/* =========================
   API
========================= */

export const recommendationsApi = createApi({
    reducerPath: "recommendationsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
    }),
    endpoints: (builder) => ({
        getRecommendations: builder.query<Recommendation[], string>({
            query: (userId) => `/recommendations/${userId}`,
        }),
    }),
});

export const {
    useGetRecommendationsQuery,useLazyGetRecommendationsQuery
} = recommendationsApi;
