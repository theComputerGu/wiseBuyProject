import { Injectable } from "@nestjs/common";
import { exec } from "child_process";
import * as path from "path";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { StoreCache, StoreCacheDocument } from "../stores/schemas/store-cache.schema";
import { geocode } from "../utils/geocode";  // ודא נתיב נכון

// ---- PATHS ------------------
const ROOT = process.cwd();
const PY   = path.join(ROOT,"venv","Scripts","python.exe");
const SCR  = path.join(ROOT,"Webscrapers");

// =============================================================
// 🔥 ScrapeService — Cache + Scraping + Merge Safe
// =============================================================
@Injectable()
export class ScrapeService {

  constructor(
    @InjectModel(StoreCache.name)
    private cacheDB: Model<StoreCacheDocument>
  ) {}

  // =============================================================
  // 🚀 MAIN BATCH – Scrape Only Missing Barcodes
  // =============================================================
  async batch(city:string, barcodes:string[]) {

    // 1) נטען מסמך יחיד לעיר (אם אין — המשך ייצור דרך upsert)
    const existing = await this.cacheDB.findOne({ city }).lean();
    const currentStores = existing?.stores ?? [];

    // -------------------------------------------------------------
    // 2) מציאת ברקודים שחסרים בחנויות הקיימות בקאש
    const missing = barcodes.filter(bc =>
      !currentStores.some(s => s.products.some(p => p.barcode === bc))
    );

    if(missing.length === 0){
      console.log(`🟢 CACHE HIT (${city}) — No scraping needed`);
      return existing;
    }

    console.log(`🔴 Scraping ${missing.length} missing products for: ${city}`);

    // -------------------------------------------------------------
    // 3) Python Scraper — רק על מה שחסר
    const scraped = await this.runPy("chpscrapperBatch.py",[city,...missing]) as Record<string, any[]>;
    if(!scraped || scraped.error) return existing;


    // -------------------------------------------------------------
    // 4) מיזוג תוצאות scraping לתוך מבנה הקאש הקיים
    for(const [barcode, rows] of Object.entries(scraped)){

      for(const row of rows){
        const [chain,,address,,price] = row;
        const storeId = chain+"_"+address;

        // --- Find/Insert store -----------------
        let store = currentStores.find(s=>s.storeId===storeId);
        if(!store){
          store = { storeId, chain, address, geo: await geocode(address), products:[] };
          currentStores.push(store);
        }

        // --- Add product only if not exists ----
        if(!store.products.some(p=>p.barcode===barcode)){
          store.products.push({
            barcode,
            price:+price||0,
            updatedAt:new Date()
          });
        }
      }
    }

    // -------------------------------------------------------------
    // 5) SAVE — Atomic Upsert (⚠ אין save() → אין כפילות!)
    await this.cacheDB.updateOne(
      { city },
      { $set:{ stores:currentStores, updatedAt:new Date() }},
      { upsert:true }
    );

    return this.cacheDB.findOne({ city });
  }

  // =============================================================
  // 🧠 PYTHON WRAPPER
  // =============================================================
  private runPy(file:string,args:string[]){
    return new Promise(resolve=>{
      const cmd=`"${PY}" "${path.join(SCR,file)}" ${args.map(a=>`"${a}"`).join(" ")}`;
      exec(cmd,(err,stdout)=>{
        if(err) return resolve({error:true});
        try{ resolve(JSON.parse(stdout)); }
        catch{ resolve({error:"parse"}); }
      });
    });
  }
}
