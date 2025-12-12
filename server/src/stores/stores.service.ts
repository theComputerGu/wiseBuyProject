import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Stores, StoresDocument } from "./schemas/stores.schema";
import { StoreOffer } from "./schemas/stores.schema";

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Stores.name)
    private readonly storesModel: Model<StoresDocument>,
  ) { }

  // =========================
  // Get stores for barcode
  // =========================
  async getByItemcode(itemcode: string) {
    return this.storesModel.findOne({ itemcode }).lean();
  }

  // =========================
  // Upsert store prices
  // =========================
  async upsertStores(
    itemcode: string,
    offers: Omit<StoreOffer, "lastUpdated">[],
  ) {
    console.log("UPSERT RAW:", `[${itemcode}]`, typeof itemcode);

    const doc = await this.storesModel.findOne({ itemcode });

    // If barcode doesn't exist — create
    if (!doc) {
      return this.storesModel.create({
        itemcode,
        stores: offers,
      });
    }

    // Merge offers
    for (const offer of offers) {
      const existing = doc.stores.find(
        s =>
          s.chain === offer.chain &&
          s.address === offer.address,
      );

      if (existing) {
        existing.price = offer.price;
        existing.lastUpdated = new Date();
      } else {
        doc.stores.push({
          ...offer,
          lastUpdated: new Date(),
        });
      }
    }

    return doc.save();
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
