// stores/scoring/types.ts

export type UserLocation = {
  lat: number;
  lon: number;
};

export type ShoppingItem = {
  itemcode: string;
  quantity: number;
};

/**
 * Minimal offer shape that scoring needs.
 */
export type StoreOffer = {
  itemcode: string;
  price: number;
};

/**
 * This is the shape scoring works with (store-centric).
 */
export type StoreEntity = {
  storeId: string;
  chain: string;
  address: string;
  lat: number;
  lon: number;
  offers: StoreOffer[];
};

export type StoreScoreBreakdown = {
  availability: number;
  price: number;
  distance: number;
  penalty: number;
};

export type StoreScoreResult = {
  score: number; // 1–100
  breakdown: StoreScoreBreakdown;
};

/* =========================================================
   Adapter-related types (for transforming current API shape)
========================================================= */

/**
 * This matches your current resolveStores output item:
 * { itemcode, stores, source }
 */
export type ResolveResponseItem<TStoreOffer = any> = {
  itemcode: string;
  stores: TStoreOffer[];
  source: "cache" | "scrape";
};

/**
 * Your DB StoreOffer (schema) likely has more fields.
 * The adapter only relies on: chain, address, price, geo (lat/lon).
 *
 * IMPORTANT: if your schema uses different property names,
 * we'll adjust here later.
 */
export type RawStoreOffer = {
  chain?: string;         // sometimes exists
  store?: string;         // sometimes scraper uses "store" for chain
  address: string;
  price: number;
  geo?: { lat: number; lon: number };

  // optional identifiers if you have them:
  storeId?: string;
  id?: string;
};

/**
 * StoreEntity + some useful aggregation metadata.
 */
export type AggregatedStore = StoreEntity & {
  /**
   * A stable key we generate for matching / dedup.
   * (usually derived from chain+address unless storeId exists)
   */
  storeKey: string;

  /**
   * Useful later for UI/debug
   */
  itemsFound: number;
  itemsMissing: number;

  /**
   * Per-item source if you care later ("cache"/"scrape").
   * Not required for scoring itself, but handy.
   */
  itemSource: Record<string, "cache" | "scrape">;
};
