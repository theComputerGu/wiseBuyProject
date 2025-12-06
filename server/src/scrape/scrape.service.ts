import { Injectable } from "@nestjs/common";
import { exec } from "child_process";
import * as path from "path";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreCache, StoreCacheDocument } from "../stores/schemas/store-cache.schema";
import { geocode } from "../utils/geocode"; // או נתיב נכון
// קאש תקף לכמה שעות לפני רענון
const TTL_HOURS = 24;
const TTL_MS = TTL_HOURS * 60 * 60 * 1000;

const ROOT = process.cwd();
const PY = path.join(ROOT,"venv","Scripts","python.exe");
const SCR = path.join(ROOT,"Webscrapers");

@Injectable()
export class ScrapeService {

  constructor(
    @InjectModel(StoreCache.name)
    private cacheDB: Model<StoreCacheDocument>
  ) {}

  // ===============================
  //  🚀 MAIN BATCH
  // ===============================
  async batch(city:string, barcodes:string[]) {

    // 1) נטען קאש עיר (או נייצר ריק)
    let cache = await this.cacheDB.findOne({ city });
    if(!cache){
      cache = new this.cacheDB({ city, stores:[], updatedAt:new Date() });
    }

    const missing:string[] = [];

    // 2) נבדוק אילו ברקודים כבר קיימים בקאש
    for(const bc of barcodes){
      const found = cache.stores.some(s =>
        s.products.some(p => p.barcode === bc)
      );
      if(!found) missing.push(bc);
    }

    // 3) אם הכל קיים בקאש → נחזיר בלי Selenium
    if(missing.length === 0){
      console.log("🟢 ALL DATA FROM CACHE", cache.stores.length, "stores");
      return cache;
    }

    // 4) אם חסר → נריץ Python רק על מה שצריך
    console.log("🔴 Missing", missing.length,"products → scraping now…");

    const scraped = await this.runPy("chpscrapperBatch.py", [city, ...missing]) as any;
    if(!scraped || (scraped as any).error) return cache;


    // 5) מיזוג התוצאות לתוך הקאש
    for(const [barcode, rows] of Object.entries(scraped)){

      for(const row of rows as any[]){
        const chain = row[0], address = row[2];
        const storeId = chain+"_"+address;

        // מציאת החנות בקאש
        let store = cache.stores.find(s => s.storeId===storeId);

        // אם לא קיימת → נוסיף חדשה
        if(!store){
          store = {
            storeId,
            chain,
            address,
            geo: await geocode(address),
            products:[]
          };
          cache.stores.push(store);
        }

        // הוספת מחיר חדש (ללא כפילות)
        if(!store.products.some(p=>p.barcode===barcode)){
          store.products.push({
            barcode,
            price: +row[4]||0,
            updatedAt:new Date()
          });
        }
      }
    }

    // 6) שמירת הקאש המעודכן כמסמך יחיד פר עיר
    cache.updatedAt = new Date();
    await cache.save();

    return cache;
  }

  // Python Wrapper
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
