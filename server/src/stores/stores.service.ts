import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Stores, StoresDocument } from "./schemas/stores.schema";
import { StoreOffer } from "./schemas/stores.schema";
import { geocodeAddress } from "./geocode"; 

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Stores.name)
    private readonly storesModel: Model<StoresDocument>,
  ) {}

  // =========================
  // Get stores for barcode
  // =========================
  async getByItemcode(itemcode: string) {
    return this.storesModel.findOne({ itemcode }).lean();
  }

  // =========================
  // Upsert store prices + geo
  // =========================
  async upsertStores(
    itemcode: string,
    offers: Omit<StoreOffer, "lastUpdated" | "geo">[],
  ) {
    console.log("UPSERT ITEMCODE:", itemcode, typeof itemcode);

    let doc = await this.storesModel.findOne({ itemcode });

    // ✅ If barcode doesn't exist — create EMPTY doc
    if (!doc) {
      doc = await this.storesModel.create({
        itemcode,
        stores: [],
      });
    }

    for (const offer of offers) {
      const existing = doc.stores.find(
        s =>
          s.chain === offer.chain &&
          s.address === offer.address,
      );

      // ✅ Existing store → update price only
      if (existing) {
        existing.price = offer.price;
        existing.lastUpdated = new Date();
        continue;
      }

      // 🧠 New store → geocode ONCE
      const geo = await geocodeAddress(offer.address);

      doc.stores.push({
        ...offer,
        geo: geo ?? undefined,
        lastUpdated: new Date(),
      });
    }

    await doc.save();
    return doc;
  }

  // =========================
  // Bulk get (used by checkout)
  // =========================
  async getMany(itemcodes: string[]) {
    return this.storesModel
      .find({ itemcode: { $in: itemcodes } })
      .lean();
  }
}
