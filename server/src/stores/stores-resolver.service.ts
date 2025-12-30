import { Injectable } from "@nestjs/common";
import { StoresService } from "./stores.service";
import { ScrapeService } from "../scrape/scrape.service";
import { StoreOffer } from "./schemas/stores.schema";

import { StoreScoringService } from "./scoring/store-scoring.service";
import { aggregateStoresByStore } from "./scoring/adapter";

@Injectable()
export class StoresResolverService {
  constructor(
    private readonly storesService: StoresService,
    private readonly scrapeService: ScrapeService,
    private readonly storeScoringService: StoreScoringService,
  ) {}

  private async reverseGeocode(
    lat: number,
    lon: number,
  ): Promise<string> {
    console.log("🌍 reverseGeocode INPUT:", { lat, lon });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "WiseBuy/1.0",
        },
      }
    );

    console.log("🌍 reverseGeocode STATUS:", res.status);

    if (!res.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await res.json();
    const addr = data.address;

    console.log("🌍 reverseGeocode ADDRESS:", addr);

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

    const normalized = `${street}, ${city}`;
    console.log("🌍 reverseGeocode RESULT:", normalized);

    return normalized;
  }

  private async geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lon: number } | null> {
    console.log("📍 geocodeAddress INPUT:", address);

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

    console.log("📍 geocodeAddress STATUS:", res.status);

    if (!res.ok) {
      console.warn("❌ Geocode failed for:", address);
      return null;
    }

    const data = await res.json();

    console.log("📍 geocodeAddress RESULT RAW:", data);

    if (!data?.length) {
      console.warn("❌ No geo result for:", address);
      return null;
    }

    const geo = {
      lat: Number(data[0].lat),
      lon: Number(data[0].lon),
    };

    console.log("📍 geocodeAddress PARSED:", geo);

    return geo;
  }

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
      scoreBreakdown: {
        availability: number;
        price: number;
        distance: number;
        penalty: number;
      };
    }[];
  }> {
    console.log("🚀 resolveStores START");
    console.log("➡️ addressKey:", addressKey);
    console.log("➡️ itemcodes:", itemcodes);

    const [lat, lon] = addressKey.split(",").map(Number);
    console.log("📍 Parsed lat/lon:", { lat, lon });

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      console.error("❌ Invalid addressKey format:", addressKey);
      throw new Error(`Invalid addressKey format: ${addressKey}`);
    }

    const normalizedAddressKey = (
      await this.reverseGeocode(lat, lon)
    )
      .trim()
      .toLowerCase();

    console.log(
      "📍 Normalized addressKey:",
      normalizedAddressKey,
    );

    const { found, missing } =
      await this.storesService.getCachedProducts(
        normalizedAddressKey,
        itemcodes,
      );

    console.log("🗄️ Cache FOUND:", found.map(f => ({
      itemcode: f.itemcode,
      stores: f.stores.length,
    })));
    console.log("🗄️ Cache MISSING:", missing);

    const results: {
      itemcode: string;
      stores: StoreOffer[];
      source: "cache" | "scrape";
    }[] = [];

    for (const product of found) {
      console.log(
        "✅ Using CACHE:",
        product.itemcode,
        product.stores.length,
      );

      results.push({
        itemcode: product.itemcode,
        stores: product.stores,
        source: "cache",
      });
    }

    for (const itemcode of missing) {
      console.log("🕷️ SCRAPING ITEM:", itemcode);

      try {
        const rawStores =
          await this.scrapeService.scrapeOne(
            itemcode,
            normalizedAddressKey,
          );

        console.log(
          "🕷️ Raw stores count:",
          rawStores.length,
        );

        const stores: StoreOffer[] = [];
        let geocodeFailed = 0;

        for (const store of rawStores) {
          console.log(
            "🏪 Raw store:",
            store.chain,
            "|",
            store.address,
            "|",
            store.price,
          );

          const geo = await this.geocodeAddress(
            store.address,
          );

          if (!geo) {
            geocodeFailed++;
            console.warn(
              "⚠️ Geocode FAILED for store address:",
              store.address,
            );
            continue;
          }

          stores.push({
            ...store,
            geo,
          });
        }

        console.log(
          "📉 Geocode failures:",
          geocodeFailed,
        );
        console.log(
          "💾 Stores after geocode:",
          stores.length,
        );

        await this.storesService.upsertProduct(
          normalizedAddressKey,
          itemcode,
          stores,
        );

        console.log(
          "💾 Upserted stores:",
          itemcode,
          stores.length,
        );

        results.push({
          itemcode,
          stores,
          source: "scrape",
        });
      } catch (err) {
        console.error(
          "❌ Scraping failed for item:",
          itemcode,
        );
        console.error(err);

        results.push({
          itemcode,
          stores: [],
          source: "scrape",
        });
      }
    }

    console.log(
      "📊 Results per item:",
      results.map(r => ({
        itemcode: r.itemcode,
        stores: r.stores.length,
        source: r.source,
      })),
    );

    const aggregatedStores =
      aggregateStoresByStore(results, itemcodes);

    console.log(
      "📊 Aggregated stores count:",
      aggregatedStores.length,
    );

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
      "🏁 Scored stores:",
      scoredStores.map(s => ({
        store: s.chain,
        score: s.score,
      })),
    );

    console.log("✅ resolveStores END");

    return {
      items: results,
      scoredStores,
    };
  }
}
