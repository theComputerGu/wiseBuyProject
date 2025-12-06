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


export async function buildStores(shopping:any[], city:string):Promise<StoreEntry[]>{
  console.log("🚀 Building store list...");

  const aggregated:Record<string,number> = {};
  shopping.forEach(i=>{
    const code=i._id?.itemcode;
    if(code) aggregated[code]=(aggregated[code]||0)+(i.quantity??1);
  });

  const barcodes=Object.keys(aggregated);

  // 🟢 1) בקשת Cache
  const cacheRes = await fetch(`${API_URL}/stores/cache`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ city, barcodes })
  });

  const cache = await cacheRes.json();
  let stores:Record<string,StoreEntry> = {};

  if(cache && cache.stores?.length){
    console.log("🟢 CACHE HIT!");
    for(const s of cache.stores){
      const id = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5,s.chain+s.address);

      stores[id] = {
        id,
        chain:s.chain,
        address:s.address,
        geo:s.geo ?? {lat:0,lon:0},
        products:s.products.map((p:any)=>({
          itemcode:p.barcode,
          price:p.price,
          amount:aggregated[p.barcode]??1
        })),
        score:0
      }
    }
  }

  // 🔥 2) אם חסרים מוצרים – Scrape
  const missing = barcodes.filter(b =>
    !Object.values(stores).some(s => s.products.some(p => p.itemcode===b))
  );

  if(missing.length>0){
    console.log("🔴 CACHE MISS → scraping:",missing);

    const scraped = await (await fetch(`${API_URL}/scrape/batch`,{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({city,barcodes:missing})
    })).json();

    for(const barcode of missing){
      const rows=scraped[barcode];
      if(!rows) continue;

      for(const row of rows){
        const chain=row[0], address=row[2], price=+row[4]||0;
        const id = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.MD5,chain+address
        );

        if(!stores[id]){
          stores[id]={
            id, chain, address,
            geo:await geocode(address),
            products:[],
            score:0
          }
        }

        stores[id].products.push({
          itemcode:barcode,
          price,
          amount:aggregated[barcode]
        })
      }
    }
  }

  // 🧠 3) לחשב מחיר סופי בצורה תקינה
  Object.values(stores).forEach(s=>{
    s.score = s.products.reduce(
      (sum:number,p:{price:number;amount:number})=> sum+p.price*p.amount
    ,0);
  });

  return Object.values(stores);
}
