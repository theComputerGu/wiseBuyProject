export type RecommendationStrategy = 'bought_together' | 'buy_again' | 'restock' | 'popular' | 'ml_predict';

export interface Recommendation {
  productId: string;
  itemcode: string;
  title: string;
  category?: string;
  image?: string;
  brand?: string;
  score: number;
  reason: string;
  strategy: RecommendationStrategy;
}

export interface PythonRecommendation {
  productId: string;
  score: number;
  reason: string;
  strategy: RecommendationStrategy;
}

export interface RecommendationEngineInput {
  cartProductIds: string[];
  allShoppingLists: Array<{
    items: Array<{ productId: string }>;
  }>;
  userHistory: Array<{
    productId: string;
    purchasedAt: string;
    category?: string;
  }>;
  allPurchases: Array<{
    productId: string;
    purchasedAt: string;
  }>;
  allProducts: string[];  // All product IDs for ML prediction
  productsData: Array<{   // Product category data for bought_together
    productId: string;
    category: string;
  }>;
  limit?: number;
}

export interface RecommendationEngineOutput {
  recommendations: PythonRecommendation[];
  error?: string;
}
