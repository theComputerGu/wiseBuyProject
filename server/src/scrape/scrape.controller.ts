import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { exec } from "child_process";
import * as path from "path";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreCache, StoreCacheDocument } from "../stores/schemas/store-cache.schema"; // ← תיקון


const ROOT = process.cwd();
const PYTHON_PATH = path.join(ROOT, "venv", "Scripts", "python.exe");
const SCRIPTS_DIR = path.join(ROOT, "Webscrapers");

const TTL_HOURS = 24;

@Controller("scrape")
export class ScrapeController {

  constructor(
    @InjectModel(StoreCache.name)
    private cacheDB: Model<StoreCacheDocument> // ← תיקון
  ) {}


  @Get("price/:barcode/:city")
  async getPrice(@Param("barcode") barcode,@Param("city") city) {
    city = decodeURIComponent(city);
    const cmd = `"${PYTHON_PATH}" "${path.join(SCRIPTS_DIR,"chpscrapperPrice.py")}" "${barcode}" "${city}"`;
    return this.execPython(cmd);
  }

  @Get("stores/:barcode/:city")
  async getStores(@Param("barcode") barcode,@Param("city") city) {
    city = decodeURIComponent(city);
    const cmd = `"${PYTHON_PATH}" "${path.join(SCRIPTS_DIR,"chpscrapperShops.py")}" "${barcode}" "${city}"`;
    return this.execPython(cmd);
  }

  @Post("batch")
  async batch(@Body() body:{city:string;barcodes:string[]}){

    const {city, barcodes}= body;
    if(!barcodes.length) return {stores:{}};

    const cached = await this.cacheDB.findOne({city});
    if (cached) {
  const ageHours = cached.updatedAt
    ? (Date.now() - cached.updatedAt.getTime()) / 3600000
    : Infinity;  // אם אין updatedAt → נכריח Scrape

  if(ageHours < TTL_HOURS){
    return cached.stores;   // 🔥 Cache תקין – מחזירים מיד
  }
}


    const cmd = `"${PYTHON_PATH}" "${path.join(SCRIPTS_DIR,"chpscrapperBatch.py")}" "${city}" ${barcodes.map(b=>`"${b}"`).join(" ")}`;
    const scraped:any = await this.execPython(cmd);

    await this.cacheDB.findOneAndUpdate(
      {city},{city,stores:scraped,updatedAt:new Date()},{upsert:true}
    );

    return scraped;
  }


  private execPython(cmd:string){
    return new Promise(resolve=>{
      exec(cmd,(e,stdout)=>{
        if(e) return resolve({error:"python failed"});
        try { resolve(JSON.parse(stdout)) }
        catch { resolve({error:"parse failed",raw:stdout}) }
      })
    })
  }
}
