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


  // 🟢 מחזיר מה־Cache רק מה שהיה שימושי ב־X שעות אחרונות
  async findValid(barcodes: string[], ttlHours:number) {

    const since = new Date(Date.now() - ttlHours * 3600 * 1000);

    const docs = await this.model.find({
  "stores.products.barcode": { $in: barcodes },
  updatedAt:{ $gte: since }
}).lean();



    // 🟢 מחזיר בצורה: { "barcodeA":[stores], "barcodeB":[stores] }
    return docs.reduce((acc, d) => {
  d.stores.forEach(store => {
    store.products.forEach(p => {
      if (!acc[p.barcode]) acc[p.barcode] = [];
      acc[p.barcode].push({
        storeId: store.storeId,
        chain: store.chain,
        address: store.address,
        geo: store.geo,
        price: p.price,
        updatedAt: p.updatedAt
      });
    });
  });
  return acc;
}, {} as Record<string, any[]>);

  }



  // 🟢 שומר Batch — לא כפול ולא פעמיים!
  async updateBatch(data:Record<string,string[][]>) {

    const ops = Object.entries(data).map(([barcode,stores]) => ({
      updateOne:{
        filter:{ barcode },
        update:{ barcode, stores, updatedAt:new Date()},
        upsert:true
      }
    }));

    return this.model.bulkWrite(ops);
  }
}
