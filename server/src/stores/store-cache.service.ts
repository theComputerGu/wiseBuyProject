import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreCache } from "./schemas/store-cache.schema";

@Injectable()
export class StoreCacheService {
  constructor(
    @InjectModel(StoreCache.name) private cacheModel: Model<StoreCache>
  ) {}

  // 📌 Retrieve cache for city + barcodes
  async resolve(city: string, barcodes: string[]) {
    return await this.cacheModel.aggregate([
      { $match: { city } },
      { $unwind: "$stores" },
      { $unwind: "$stores.products" },
      { $match: { "stores.products.barcode": { $in: barcodes } } },
      {
        $group: {
          _id: "$city",
          stores: { $push: "$stores" }
        }
      }
    ]);
  }

  // 📌 SAFE UPSERT → no duplicates, no version errors
  async upsert(city: string, stores: any[]) {
    return await this.cacheModel.findOneAndUpdate(
      { city },
      { $set: { stores } },      // לא עושים push – מחליפים רשימה אחת נקייה
      { upsert: true, new: true }
    );
  }
}
