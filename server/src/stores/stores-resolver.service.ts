// import { Injectable } from "@nestjs/common";
// import { StoresService } from "./stores.service";
// import { ScrapeService } from "../scrape/scrape.service";
// import { StoreOffer } from "./schemas/stores.schema";

// @Injectable()
// export class StoresResolverService {
//   constructor(
//     private readonly storesService: StoresService,
//     private readonly scrapeService: ScrapeService,
//   ) {}

//   /* ======================================================
//      Reverse Geocoding: lat/lon -> "Street, City"
//   ====================================================== */
//   private async reverseGeocode(
//     lat: number,
//     lon: number,
//   ): Promise<string> {
//     const res = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
//       {
//         headers: {
//           "User-Agent": "WiseBuy/1.0",
//         },
//       }
//     );

//     if (!res.ok) {
//       throw new Error(`Reverse geocoding failed`);
//     }

//     const data = await res.json();
//     const addr = data.address;

//     if (!addr) {
//       throw new Error("No address data from reverse geocode");
//     }

//     const city =
//       addr.city ||
//       addr.town ||
//       addr.village ||
//       addr.municipality;

//     const street =
//       addr.road ||
//       addr.pedestrian ||
//       addr.residential;

//     if (!city || !street) {
//       throw new Error(
//         `Incomplete address: ${JSON.stringify(addr)}`
//       );
//     }

//     return `${street}, ${city}`;
//   }

//   /* ======================================================
//      Forward Geocoding: address -> lat/lon (לחנויות)
//   ====================================================== */
//   private async geocodeAddress(
//     address: string,
//   ): Promise<{ lat: number; lon: number } | null> {
//     const res = await fetch(
//       `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//         address
//       )}&limit=1`,
//       {
//         headers: {
//           "User-Agent": "WiseBuy/1.0",
//         },
//       }
//     );

//     if (!res.ok) {
//       console.warn("❌ Geocode failed for:", address);
//       return null;
//     }

//     const data = await res.json();

//     if (!data?.length) {
//       console.warn("❌ No geo result for:", address);
//       return null;
//     }

//     return {
//       lat: Number(data[0].lat),
//       lon: Number(data[0].lon),
//     };
//   }

//   /* ======================================================
//      Main Resolver
//   ====================================================== */
//   async resolveStores(
//     addressKey: string, 
//     itemcodes: string[],
//   ): Promise<
//     {
//       itemcode: string;
//       stores: StoreOffer[];
//       source: "cache" | "scrape";
//     }[]
//   > {
//     // 1️⃣ פירוק קואורדינטות של המשתמש
//     const [lat, lon] = addressKey.split(",").map(Number);

//     if (Number.isNaN(lat) || Number.isNaN(lon)) {
//       throw new Error(
//         `Invalid addressKey format: ${addressKey}`
//       );
//     }

//     // 2️⃣ Reverse geocode למיקום המשתמש (רחוב, עיר)
//     const address = await this.reverseGeocode(lat, lon);
//     console.log("📍 User address:", address);

//     // 3️⃣ בדיקת cache לפי lat/lon
//     const { found, missing } =
//       await this.storesService.getCachedProducts(
//         addressKey,
//         itemcodes,
//       );

//     const results: {
//       itemcode: string;
//       stores: StoreOffer[];
//       source: "cache" | "scrape";
//     }[] = [];

//     // 4️⃣ תוצאות מה-cache
//     for (const product of found) {
//       results.push({
//         itemcode: product.itemcode,
//         stores: product.stores,
//         source: "cache",
//       });
//     }

//     // 5️⃣ חסרים → scrape + geocode לחנויות
//     for (const itemcode of missing) {
//       const rawStores =
//         await this.scrapeService.scrapeOne(
//           itemcode,
//           address,
//         );

//       const stores: StoreOffer[] = [];

//       for (const store of rawStores) {
//         const geo = await this.geocodeAddress(store.address);

//         if (!geo) continue; // בלי lat/lon לא שומרים

//         stores.push({
//           ...store,
//           geo,
//         });
//       }

//       await this.storesService.upsertProduct(
//         addressKey,
//         itemcode,
//         stores,
//       );

//       results.push({
//         itemcode,
//         stores,
//         source: "scrape",
//       });
//     }

//     return results;
//   }
// }



import { Injectable } from "@nestjs/common";
import { StoresService } from "./stores.service";
import { ScrapeService } from "../scrape/scrape.service";
import { StoreOffer } from "./schemas/stores.schema";

// ➕ NEW
import { StoreScoringService } from "./scoring/store-scoring.service";
import { aggregateStoresByStore } from "./scoring/adapter";

@Injectable()
export class StoresResolverService {
  constructor(
    private readonly storesService: StoresService,
    private readonly scrapeService: ScrapeService,

    // ➕ NEW
    private readonly storeScoringService: StoreScoringService,
  ) {}

  /* ======================================================
     Reverse Geocoding: lat/lon -> "Street, City"
     (משמש כ־addressKey ל־DB)
  ====================================================== */
  private async reverseGeocode(
    lat: number,
    lon: number,
  ): Promise<string> {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "WiseBuy/1.0",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await res.json();
    const addr = data.address;

    if (!addr) {
      throw new Error("No address data from reverse geocode");
    }

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality;

    const street =
      addr.road ||
      addr.pedestrian ||
      addr.residential;

    if (!city || !street) {
      throw new Error(
        `Incomplete address: ${JSON.stringify(addr)}`
      );
    }

    return `${street}, ${city}`;
  }

  /* ======================================================
     Forward Geocoding: address -> lat/lon (לחנויות)
  ====================================================== */
  private async geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lon: number } | null> {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "WiseBuy/1.0",
        },
      }
    );

    if (!res.ok) {
      console.warn("❌ Geocode failed for:", address);
      return null;
    }

    const data = await res.json();

    if (!data?.length) {
      console.warn("❌ No geo result for:", address);
      return null;
    }

    return {
      lat: Number(data[0].lat),
      lon: Number(data[0].lon),
    };
  }

  /* ======================================================
     Main Resolver
  ====================================================== */
  async resolveStores(
    addressKey: string,
    itemcodes: string[],
  ): Promise<{
    items: {
      itemcode: string;
      stores: StoreOffer[];
      source: "cache" | "scrape";
    }[];
    scoredStores: {
      storeId: string;
      chain: string;
      address: string;
      lat: number;
      lon: number;
      score: number;
      totalPrice: number;
      scoreBreakdown: {
        availability: number;
        price: number;
        distance: number;
        penalty: number;
      };
    }[];
  }> {
    // 1️⃣ פירוק קואורדינטות של המשתמש
    const [lat, lon] = addressKey.split(",").map(Number);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new Error(
        `Invalid addressKey format: ${addressKey}`
      );
    }

    // 2️⃣ Reverse geocode → כתובת מנורמלת
    const normalizedAddressKey = (
      await this.reverseGeocode(lat, lon)
    )
      .trim()
      .toLowerCase();

    console.log("📍 Normalized addressKey:", normalizedAddressKey);

    // 3️⃣ בדיקת cache לפי כתובת
    const { found, missing } =
      await this.storesService.getCachedProducts(
        normalizedAddressKey,
        itemcodes,
      );

    const results: {
      itemcode: string;
      stores: StoreOffer[];
      source: "cache" | "scrape";
    }[] = [];

    // 4️⃣ תוצאות מה־cache
    for (const product of found) {
      results.push({
        itemcode: product.itemcode,
        stores: product.stores,
        source: "cache",
      });
    }

    // 5️⃣ חסרים → scrape + geocode לחנויות
    for (const itemcode of missing) {
      const rawStores =
        await this.scrapeService.scrapeOne(
          itemcode,
          normalizedAddressKey,
        );

      const stores: StoreOffer[] = [];

      for (const store of rawStores) {
        const geo = await this.geocodeAddress(store.address);
        if (!geo) continue;

        stores.push({
          ...store,
          geo,
        });
      }

      await this.storesService.upsertProduct(
        normalizedAddressKey,
        itemcode,
        stores,
      );

      results.push({
        itemcode,
        stores,
        source: "scrape",
      });
    }

    // ======================================================
    // ➕ Aggregation + Scoring (IN-MEMORY ONLY)
    // ======================================================

    const aggregatedStores =
      aggregateStoresByStore(results, itemcodes);

    const scoredStores =
      this.storeScoringService.scoreStores(
        aggregatedStores,
        itemcodes.map(code => ({
          itemcode: code,
          quantity: 1,
        })),
        { lat, lon },
      );

    console.log(
      "🏪 SCORED STORES:",
      scoredStores.map(s => ({
        store: s.chain,
        score: s.score,
        breakdown: s.scoreBreakdown,
      })),
    );

    // ✅ NEW RESPONSE SHAPE
    return {
      items: results,
      scoredStores,
    };
  }
}
