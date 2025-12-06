import { Controller, Post, Body } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreCache, StoreCacheDocument } from "./schemas/store-cache.schema";

@Controller("stores")
export class StoreCacheController {

  constructor(
    @InjectModel(StoreCache.name)
    private model: Model<StoreCacheDocument>
  ) {}

  @Post("cache")
  async getCache(@Body() body:{ city:string, barcodes:string[] }) {

    const doc = await this.model.findOne({ city: body.city }).lean();

    if (!doc) return { stores: [] };

   const filteredStores = doc.stores
  .map(store => ({
    ...store,
    products: store.products.filter(p => body.barcodes.includes(p.barcode))
  }))
  .filter(s => s.products.length > 0); // חנות נשארת רק אם יש מוצרים רלוונטיים


    return { stores: filteredStores };
  }
}
