// stores/scoring/adapter.ts

import {
  AggregatedStore,
  RawStoreOffer,
  ResolveResponseItem,
  ShoppingItem,
} from "./types";

/**
 * Build a stable key for a store.
 * Priority:
 * 1) storeId/id if exists
 * 2) chain + address (normalized)
 */
function buildStoreKey(raw: RawStoreOffer): string {
  const explicitId = raw.storeId || raw.id;
  if (explicitId) return String(explicitId);

  const chain = (raw.chain || raw.store || "unknown")
    .trim()
    .toLowerCase();

  const address = (raw.address || "")
    .trim()
    .toLowerCase();

  return `${chain}|${address}`;
}

/**
 * Resolve chain name from possible fields.
 */
function getChain(raw: RawStoreOffer): string {
  return (raw.chain || raw.store || "Unknown").trim();
}

/**
 * Convert the current resolveStores output (item-centric)
 * into store-centric aggregated list (for scoring).
 *
 * - Does NOT change your API externally.
 * - Pure in-memory transformation.
 */
export function aggregateStoresByStore(
  resultsByItem: ResolveResponseItem<RawStoreOffer>[],
  shoppingList: ShoppingItem[] | string[],
): AggregatedStore[] {
  const shoppingCodes = Array.isArray(shoppingList)
    ? shoppingList.map((x: any) =>
        typeof x === "string" ? x : x.itemcode
      )
    : [];

  const storeMap = new Map<string, AggregatedStore>();

  for (const itemResult of resultsByItem) {
    const itemcode = itemResult.itemcode;
    const source = itemResult.source;

    for (const rawStore of itemResult.stores ?? []) {
      // Must have geo for distance scoring (and map UI)
      if (!rawStore?.geo) continue;

      const storeKey = buildStoreKey(rawStore);

      let agg = storeMap.get(storeKey);
      if (!agg) {
        agg = {
          storeKey,
          storeId: rawStore.storeId || rawStore.id || storeKey,
          chain: getChain(rawStore),
          address: rawStore.address,
          lat: rawStore.geo.lat,
          lon: rawStore.geo.lon,
          offers: [],
          itemsFound: 0,
          itemsMissing: 0,
          itemSource: {},
        };
        storeMap.set(storeKey, agg);
      }

      // Avoid duplicates per itemcode per store
      const exists = agg.offers.some(o => o.itemcode === itemcode);
      if (!exists) {
        agg.offers.push({
          itemcode,
          price: rawStore.price,
        });
      }

      agg.itemSource[itemcode] = source;
    }
  }

  // Fill found/missing counts for each store
  const stores = Array.from(storeMap.values());

  for (const s of stores) {
    const foundSet = new Set(s.offers.map(o => o.itemcode));
    const total = Math.max(shoppingCodes.length, 1);
    const found = shoppingCodes.filter(c => foundSet.has(c)).length;
    s.itemsFound = found;
    s.itemsMissing = total - found;
  }

  return stores;
}
