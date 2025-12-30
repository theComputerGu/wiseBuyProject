import {
  AggregatedStore,
  RawStoreOffer,
  ResolveResponseItem,
  ShoppingItem,
} from "./types";

function buildStoreKey(raw: RawStoreOffer): string {
  const explicitId = raw.storeId || raw.id;

  console.log("🔑 buildStoreKey INPUT:", {
    storeId: raw.storeId,
    id: raw.id,
    chain: raw.chain,
    address: raw.address,
  });

  if (explicitId) {
    console.log("🔑 buildStoreKey USING explicitId:", explicitId);
    return String(explicitId);
  }

  const chain = (raw.chain || raw.store || "unknown")
    .trim()
    .toLowerCase();

  const address = (raw.address || "")
    .trim()
    .toLowerCase();

  const key = `${chain}|${address}`;

  console.log("🔑 buildStoreKey FALLBACK:", key);

  return key;
}

function getChain(raw: RawStoreOffer): string {
  const chain = (raw.chain || raw.store || "Unknown").trim();
  console.log("🏷️ getChain:", chain);
  return chain;
}

export function aggregateStoresByStore(
  resultsByItem: ResolveResponseItem<RawStoreOffer>[],
  shoppingList: ShoppingItem[] | string[],
): AggregatedStore[] {
  console.log("📊 aggregateStoresByStore START");
  console.log(
    "📊 resultsByItem count:",
    resultsByItem.length,
  );

  const shoppingCodes = Array.isArray(shoppingList)
    ? shoppingList.map((x: any) =>
        typeof x === "string" ? x : x.itemcode,
      )
    : [];

  console.log("🛒 shoppingCodes:", shoppingCodes);

  const storeMap = new Map<string, AggregatedStore>();

  for (const itemResult of resultsByItem) {
    const itemcode = itemResult.itemcode;
    const source = itemResult.source;

    console.log(
      "📦 Processing item:",
      itemcode,
      "stores:",
      itemResult.stores?.length ?? 0,
      "source:",
      source,
    );

    for (const rawStore of itemResult.stores ?? []) {
      console.log("🏪 Raw store:", {
        chain: rawStore.chain,
        address: rawStore.address,
        price: rawStore.price,
        geo: rawStore.geo,
      });

      if (!rawStore?.geo) {
        console.warn(
          "⚠️ Adapter: Skipping store - missing geo",
          {
            itemcode,
            chain: rawStore?.chain,
            address: rawStore?.address,
          },
        );
        continue;
      }

      const storeKey = buildStoreKey(rawStore);

      let agg = storeMap.get(storeKey);
      if (!agg) {
        console.log("➕ Creating new aggregated store:", storeKey);

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
      } else {
        console.log("🔁 Reusing aggregated store:", storeKey);
      }

      const exists = agg.offers.some(
        o => o.itemcode === itemcode,
      );

      if (!exists) {
        console.log(
          "➕ Adding offer:",
          itemcode,
          "price:",
          rawStore.price,
        );

        agg.offers.push({
          itemcode,
          price: rawStore.price,
        });
      } else {
        console.log(
          "⏭️ Offer already exists:",
          itemcode,
        );
      }

      agg.itemSource[itemcode] = source;
    }
  }

  const stores = Array.from(storeMap.values());

  console.log(
    "📊 Aggregated stores BEFORE availability calc:",
    stores.length,
  );

  for (const s of stores) {
    const foundSet = new Set(
      s.offers.map(o => o.itemcode),
    );
    const total = Math.max(shoppingCodes.length, 1);
    const found = shoppingCodes.filter(c =>
      foundSet.has(c),
    ).length;

    s.itemsFound = found;
    s.itemsMissing = total - found;

    console.log("📊 Store availability:", {
      storeKey: s.storeKey,
      itemsFound: s.itemsFound,
      itemsMissing: s.itemsMissing,
      offers: s.offers.length,
    });
  }

  console.log(
    "🏁 aggregateStoresByStore END. Final stores:",
    stores.map(s => ({
      storeKey: s.storeKey,
      offers: s.offers.length,
      itemsFound: s.itemsFound,
      itemsMissing: s.itemsMissing,
    })),
  );

  return stores;
}
