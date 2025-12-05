import { Injectable } from "@nestjs/common";
import { exec } from "child_process";
import * as path from "path";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreCache, StoreCacheDocument } from "../stores/schemas/store-cache.schema"; // ← תיקון

// =================== Paths ===================
const ROOT = process.cwd();
const PY  = path.join(ROOT,"venv","Scripts","python.exe");
const SCR = path.join(ROOT,"Webscrapers");

// Cache 24h
const CACHE_HOURS = 24;
const CACHE_MS = CACHE_HOURS * 60 * 60 * 1000;

@Injectable()
export class ScrapeService {

  constructor(
    @InjectModel(StoreCache.name)
    private cacheModel: Model<StoreCacheDocument> // ← תיקון
  ) {}

  // 1) PRICE SCRAPE — נשאר כמו שהיה
  singlePrice(barcode:string, city:string){
    return this.py(`chpscrapperPrice.py`, [barcode,city]);
  }

  // 2) SINGLE PRODUCT → עם Cache
  async singleStores(barcode:string, city:string){
    const cached = await this.getCache(barcode,city);
    if(cached) return cached.stores;

    const scraped:any = await this.py(`chpscrapperShops.py`, [barcode,city]);
    if(scraped?.stores) this.saveCache(barcode,city,scraped.stores);
    return scraped.stores ?? [];
  }

  // 3) 🔥 BATCH SCRAPE — חוסך זמן משמעותי
  async batchScrape(city:string, barcodes:string[]){

    const result:Record<string,any[]> = {};
    const needScrape:string[] = [];

    // קודם נבדוק Cache
    for(const bc of barcodes){
      const cached = await this.getCache(bc,city);
      if(cached) result[bc] = cached.stores;
      else needScrape.push(bc);
    }

    if(needScrape.length === 0) return result;

    // רק מה שחסר — Python
    const batch:any = await this.py(`chpscrapperBatch.py`, [city,...needScrape]);
    if(batch.error) return result;

    // נשמור Cache לכל אחד
    for(const bc of needScrape){
      if(batch[bc]){
        await this.saveCache(bc,city,batch[bc]);
        result[bc] = batch[bc];
      }
    }

    return result;
  }


  // ========= CACHE =========
  private async getCache(barcode:string, city:string){
    const doc = await this.cacheModel.findOne({ barcode,city });
    if(!doc) return null;

    if (!doc.updatedAt) return null;
const age = Date.now() - doc.updatedAt.getTime();
return age < CACHE_MS ? doc : null;

  }

  private saveCache(barcode:string, city:string, stores:any[]){
    return this.cacheModel.findOneAndUpdate(
      { barcode,city },
      { stores, updatedAt:new Date() },
      { upsert:true }
    );
  }


  // ===== PYTHON WRAPPER =====
  private py(file:string, args:string[]){
    const cmd = `"${PY}" "${path.join(SCR,file)}" ${args.map(a=>`"${a}"`).join(" ")}`;
    return new Promise(resolve=>{
      exec(cmd,(e,stdout)=>{
        if(e) return resolve({error:"python failed",raw:e});
        try { resolve(JSON.parse(stdout)); }
        catch { resolve({error:"json parse",raw:stdout}); }
      });
    });
  }
}
