import { Injectable } from "@nestjs/common";
import {
  StoreEntity,
  ShoppingItem,
  UserLocation,
} from "./types";
import { scoreStore } from "./score-store";

/* =========================
   Helper: Median
========================= */
function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

@Injectable()
export class StoreScoringService {
  scoreStores(
    stores: StoreEntity[],
    shoppingList: ShoppingItem[],
    userLocation: UserLocation,
  ) {
    const allPrices = stores.flatMap(s =>
      s.offers.map(o => o.price),
    );

    const priceStats = {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices),
    };

    // Build per-item max price map (worst price for each item across all stores)
    const itemMaxPrices = new Map<string, number>();
    for (const item of shoppingList) {
      let maxPrice = 0;
      for (const store of stores) {
        const offer = store.offers.find(o => o.itemcode === item.itemcode);
        if (offer && offer.price > maxPrice) {
          maxPrice = offer.price;
        }
      }
      itemMaxPrices.set(item.itemcode, maxPrice);
    }

    // =========================
    // 1️⃣ First pass: rawScores
    // =========================
    const rawScores = stores.map(store =>
      scoreStore(
        store,
        shoppingList,
        userLocation,
        priceStats,
        itemMaxPrices,
        0, // midpoint זמני
      ).rawScore,
    );

    // =========================
    // 2️⃣ Median midpoint
    // =========================
    const midpoint = median(rawScores);

    // =========================
    // 3️⃣ Final scoring
    // =========================
    return stores
      .map(store => {
        const result = scoreStore(
          store,
          shoppingList,
          userLocation,
          priceStats,
          itemMaxPrices,
          midpoint, // ⭐ חציון דינמי
        );

        return {
          ...store,
          score: result.score,
          totalPrice: result.totalPrice,
          scoreBreakdown: result.breakdown,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
