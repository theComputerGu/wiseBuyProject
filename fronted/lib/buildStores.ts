import * as Crypto from "expo-crypto";
import { StoreEntry, StoreProduct } from "../types/Store";
import { API_URL } from "@env";

// ----------------------------------------------------
// Convert Hebrew address → GEO coordinates
// ----------------------------------------------------
async function geocode(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "WiseBuy-App" },
    });

    const data = await res.json();

    if (!data || data.length === 0) return { lat: 0, lon: 0 };

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch (err) {
    console.log("GEO ERROR:", err);
    return { lat: 0, lon: 0 };
  }
}

// ----------------------------------------------------
// MAIN FUNCTION — Build store list from shopping list
// ----------------------------------------------------
export async function buildStores(shoppingItems: any[], city: string) {
  console.log("📌 BUILD STORES — Starting…");
  console.log("🌍 API_URL =", API_URL);
  console.log("🏙 CITY =", city);

  let storesMap: Record<string, StoreEntry> = {};

  for (const item of shoppingItems) {
    console.log("🟨 ITEM:", item);

    // -----------------------------------------
    // FIX: itemcode was WRONG (barcode ❌)
    // -----------------------------------------
    const itemcode = item._id?.itemcode;
    const amount = item.quantity;

    console.log("🟦 ITEMCODE =", itemcode);

    if (!itemcode) {
      console.log("❌ SKIP — No itemcode for item:", item);
      continue;
    }

    const encodedCity = encodeURIComponent(city);
    const url = `${API_URL}/scrape/stores/${itemcode}/${encodedCity}`;

    console.log("📡 FETCHING URL:", url);

    let text = "";
    let data = null;

    try {
      const res = await fetch(url);

      console.log("📡 RESPONSE STATUS:", res.status);

      text = await res.text();
      console.log("📡 RAW RESPONSE TEXT:", text);

      data = JSON.parse(text);
    } catch (err) {
      console.log("❌ JSON PARSE ERROR:", err);
      console.log("❌ RAW:", text);
      continue;
    }

    if (!data?.stores) {
      console.log("⚠ No stores returned for", itemcode);
      continue;
    }

    console.log(`🟩 STORES returned for ${itemcode}:`, data.stores.length);

    //------------------------------
    // LOOP OVER RAW CHP ROWS
    //------------------------------
    for (const row of data.stores) {
      console.log("➡ STORE ROW:", row);

      const chain = row[0];
      const branch = row[1];
      const address = row[2];
      const price = parseFloat(row[4] || "0");

      const uniqueId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        chain + branch + address
      );

      if (!storesMap[uniqueId]) {
        console.log("📍 Geocoding:", address);
        const geo = await geocode(address);

        storesMap[uniqueId] = {
          id: uniqueId,
          chain,
          city: branch,
          address,
          geo,
          products: [],
          score: 0,
        };
      }

      storesMap[uniqueId].products.push({
        itemcode,
        price,
        amount,
      });
    }
  }

  //------------------------------
  // FINAL — CALCULATE SCORE
  //------------------------------
  for (const store of Object.values(storesMap)) {
    let total = 0;
    for (const p of store.products) {
      total += p.price * p.amount;
    }
    store.score = total;
  }

  console.log("📦 FINAL STORES:", Object.values(storesMap));

  return Object.values(storesMap);
}
