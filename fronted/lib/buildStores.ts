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

// ========================
// Distance calculator
// ========================
function distanceKm(lat1:number, lon1:number, lat2:number, lon2:number){
  const R=6371;
  const dLat=(lat2-lat1)*Math.PI/180;
  const dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 +
           Math.cos(lat1*Math.PI/180) *
           Math.cos(lat2*Math.PI/180) *
           Math.sin(dLon/2)**2;
  return R*(2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}

// ========================
// Raw score (un-normalized)
// ========================
function rawRating(store:StoreEntry, total:number, user:{lat:number,lon:number}){
  const found = store.products.length;
  const missing = total - found;
  const price = store.products.reduce((s,p)=>s+p.price*p.amount,0);
  const dist = distanceKm(user.lat,user.lon,store.geo.lat,store.geo.lon);

  return (found*20) - (missing*25) - price*0.35 - dist*2.5;
}

// ========================
// S-curve normalization → ⭐⭐⭐⭐⭐
// ========================
function normalizeRatings(stores:StoreEntry[]){
  
  const vals = stores.map(s=>s.rating);
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
  const std = Math.sqrt(vals.reduce((a,b)=>a+(b-avg)**2,0)/vals.length) || 1;

  stores.forEach(s=>{
    const z = (s.rating - avg) / std;
    const sigmoid = 1/(1+Math.exp(-z));  // 0–1
    s.rating = Math.round(sigmoid*100);   // 0–100 בפועל
    s.stars  = Math.max(1,Math.round((sigmoid*5)));  // 1–5 ⭐⭐⭐
  });

  return stores.sort((a,b)=> b.rating - a.rating);
}



// ========================
// MAIN BUILD FUNCTION
// ========================
export async function buildStores(
  shopping:any[], city:string, userLocation:{lat:number,lon:number}
):Promise<StoreEntry[]>{

  console.log("🚀 Building Store List...");

  const aggregated:Record<string,number> = {};
  shopping.forEach(i=>{
    const code=i._id?.itemcode;
    if(code) aggregated[code]=(aggregated[code]||0)+(i.quantity??1);
  });

  const barcodes = Object.keys(aggregated);
  let stores:Record<string,StoreEntry> = {};


  // 1) CACHE
  const cacheRes = await fetch(`${API_URL}/stores/cache`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ city, barcodes })
  });

  const cache = await cacheRes.json();

  if(cache && cache.stores?.length){
    console.log("🟢 CACHE HIT");

    for(const s of cache.stores){
      const id=await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5,s.chain+s.address);

      stores[id]={
        id,
        chain:s.chain,
        address:s.address,
        geo:s.geo ?? {lat:0,lon:0},
        products:s.products.map((p:any)=>({
          itemcode:p.barcode,
          price:p.price,
          amount:aggregated[p.barcode] ?? 1
        })),
        score:0,rating:0,stars:0
      }
    }
  }


  // 2) SCRAPE missing only
  const missing = barcodes.filter(
    b=>!Object.values(stores).some(s=>s.products.some(p=>p.itemcode===b))
  );

  if(missing.length){
    console.log("🔴 SCRAPE →", missing);

    const scraped = await (await fetch(`${API_URL}/scrape/batch`,{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({city,barcodes:missing})
    })).json();

    for(const barcode of missing){
      const rows=scraped[barcode]; if(!rows) continue;

      for(const row of rows){
        const chain=row[0], address=row[2], price=+row[4]||0;
        const id=await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5,chain+address);

        if(!stores[id]){
          stores[id]={id,chain,address,geo:await geocode(address),products:[],score:0,rating:0,stars:0};
        }

        stores[id].products.push({itemcode:barcode,price,amount:aggregated[barcode]});
      }
    }
  }


  // 3) Final scoring
  Object.values(stores).forEach(s=>{
    s.score = s.products.reduce((sum,p)=>sum+p.price*p.amount,0);
    s.rating = rawRating(s,barcodes.length,userLocation);
  });

  return normalizeRatings(Object.values(stores));
}
