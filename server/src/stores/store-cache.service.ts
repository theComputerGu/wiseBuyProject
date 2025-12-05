import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreCache, StoreCacheDocument } from "./schemas/store-cache.schema";

@Injectable()
export class StoreCacheService {

  constructor(
    @InjectModel(StoreCache.name)
    private model: Model<StoreCacheDocument>
  ) {}

  // === Load records if fresh (<TTL hours)
  async findValid(barcodes:string[], ttlHours:number) {
    const since = new Date(Date.now() - ttlHours * 3600 * 1000);

    const docs = await this.model.find({
      barcode: { $in: barcodes },
      updatedAt:{ $gte: since }
    }).lean();

    return docs.reduce((acc,d)=>{
      acc[d.barcode] = d.stores;
      return acc;
    },{} as Record<string,string[][]>);
  }

  // === Insert or update scraped results
  async updateBatch(data:Record<string,string[][]>) {
    const ops = Object.entries(data).map(([barcode,stores]) => ({
      updateOne:{
        filter:{ barcode },
        update:{ barcode, stores },
        upsert:true
      }
    }));
    return this.model.bulkWrite(ops);
  }
}
