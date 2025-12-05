// =====================================================
// BUILD STORES — batch + multi-product correct merge 🔥
// =====================================================

import * as Crypto from "expo-crypto";
import { API_URL } from "@env";
import { StoreEntry } from "../types/Store";

type GeoPoint = { lat:number; lon:number };
const geoCache:Record<string,GeoPoint> = {};

async function geocode(address:string):Promise<GeoPoint>{
  if(!address) return {lat:0,lon:0};
  if(geoCache[address]) return geoCache[address];

  try{
    const url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const d=await (await fetch(url,{headers:{ "User-Agent":"WiseBuy-App" }})).json();
    return geoCache[address]=d?.length?{lat:+d[0].lat,lon:+d[0].lon}:{lat:0,lon:0};
  }catch{
    return geoCache[address]={lat:0,lon:0};
  }
}


// =====================================================
// MAIN
// =====================================================
export async function buildStores(shopping:any[], city:string){

  console.log("📦 buildStores — /scrape/batch");
  const aggregated:Record<string,number> = {};

  // count amount per barcode
  shopping.forEach(i=>{
    const code=i._id?.itemcode;
    if(!code) return;
    aggregated[code]=(aggregated[code]||0)+(i.quantity??1);
  });

  const barcodes=Object.keys(aggregated);
  console.log("🔍 ITEMS:",barcodes.length);

  // 🔥 one batch request
  const batch=await (await fetch(`${API_URL}/scrape/batch`,{
    method:"POST",
    headers:{ "Content-Type":"application/json"},
    body:JSON.stringify({city,barcodes})
  })).json();


  const stores:Record<string,StoreEntry> = {};

  for(const barcode of barcodes){
    const rows=batch[barcode];
    if(!rows) continue;

    for(const row of rows){
      const chain=row[0], branch=row[1], address=row[2];
      const price=+row[4]||0;
      const amount=aggregated[barcode];

      const id=await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        chain+branch+address
      );

      if(!stores[id]){
        stores[id]={
          id, chain, city:branch, address,
          geo:await geocode(address),
          products:[], score:0
        };
      }

      // ← FIX: לא מוחקים מוצרים קודמים, רק מוסיפים ברקוד נוסף 🔥
      stores[id].products.push({ itemcode:barcode, price, amount });
    }
  }

  Object.values(stores).forEach(s=>{
    s.score=s.products.reduce((sum,p)=>sum+p.price*p.amount,0);
  });

  return Object.values(stores);
}
