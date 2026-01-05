import {
  StoreEntity,
  ShoppingItem,
  UserLocation,
  StoreScoreResult,
} from "./types";
import {
  SCORE_WEIGHTS,
  DISTANCE_THRESHOLDS_KM,
} from "./weights";
import { normalizeScore } from "./normalize";

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function scoreStore(
  store: StoreEntity,
  shoppingList: ShoppingItem[],
  userLocation: UserLocation,
  globalPriceStats: { min: number; max: number },
  midpoint: number,
): StoreScoreResult & { rawScore: number } {
  const storePriceMap = new Map(
    store.offers.map(o => [o.itemcode, o.price]),
  );

  // 1️⃣ Availability
  let found = 0;
  let missing = 0;

  shoppingList.forEach(item => {
    storePriceMap.has(item.itemcode)
      ? found++
      : missing++;
  });

  const availabilityScore =
    (found / Math.max(shoppingList.length, 1)) *
    SCORE_WEIGHTS.AVAILABILITY_MAX;

  // 2️⃣ Price (penalize stores with missing items)
  const prices = shoppingList
    .map(i => storePriceMap.get(i.itemcode))
    .filter((p): p is number => p !== undefined);

  // If store has no items, give worst price score
  let priceScore = 0;
  if (prices.length > 0) {
    const avgPrice =
      prices.reduce((a, b) => a + b, 0) / prices.length;

    // Base price score from average price
    const basePriceScore =
      SCORE_WEIGHTS.PRICE_MAX *
      (1 -
        (avgPrice - globalPriceStats.min) /
          Math.max(
            globalPriceStats.max - globalPriceStats.min,
            1,
          ));

    // Penalize based on missing items ratio
    const availabilityRatio = found / Math.max(shoppingList.length, 1);
    priceScore = basePriceScore * availabilityRatio;
  }

  // 3️⃣ Distance
  const dist = distanceKm(
    userLocation.lat,
    userLocation.lon,
    store.lat,
    store.lon,
  );

  let distanceScore = 0;
  if (dist <= DISTANCE_THRESHOLDS_KM.NEAR) {
    distanceScore = SCORE_WEIGHTS.DISTANCE_MAX;
  } else if (dist <= DISTANCE_THRESHOLDS_KM.MID) {
    distanceScore = SCORE_WEIGHTS.DISTANCE_MAX * 0.7;
  } else if (dist <= DISTANCE_THRESHOLDS_KM.FAR) {
    distanceScore = SCORE_WEIGHTS.DISTANCE_MAX * 0.4;
  }


  // Raw score
  const rawScore = availabilityScore + priceScore + distanceScore;

  let finalScore = rawScore;

  // Calculate total price only for items the store has
  const totalPrice = shoppingList.reduce((sum, item) => {
    const itemPrice = storePriceMap.get(item.itemcode);
    if (itemPrice === undefined) return sum; // Skip missing items
    return sum + itemPrice * (item.quantity || 1);
  }, 0);

  return {
    rawScore,
    score: Math.round(finalScore),
    totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimals
    breakdown: {
      availability: Math.round(
        (availabilityScore /
          SCORE_WEIGHTS.AVAILABILITY_MAX) *
          100,
      ),
      price: Math.round(
        (priceScore /
          SCORE_WEIGHTS.PRICE_MAX) *
          100,
      ),
      distance: Math.round(
        (distanceScore /
          SCORE_WEIGHTS.DISTANCE_MAX) *
          100,
      ),
    },
  };
}
