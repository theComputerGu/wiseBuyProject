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
  ) {}


  async getOrCreateAddress(addressKey: string) {
    let doc = await this.storesModel.findOne({ addressKey });
    if (!doc) {
      doc = await this.storesModel.create({
        addressKey,
        products: [],
      });
    }
    return doc;
  }


  async getCachedProducts(
  addressKey: string,
  itemcodes: string[],
): Promise<{
  found: {
    itemcode: string;
    stores: StoreOffer[];
  }[];
  missing: string[];
}> {
  const doc = await this.storesModel.findOne({ addressKey }).lean();

  if (!doc) {
    return {
      found: [],
      missing: itemcodes,
    };
  }

  const foundProducts = doc.products.filter(p =>
    itemcodes.includes(p.itemcode),
  );

  const foundCodes = foundProducts.map(p => p.itemcode);

  const missing = itemcodes.filter(
    code => !foundCodes.includes(code),
  );

  return {
    found: foundProducts.map(p => ({
      itemcode: p.itemcode,
      stores: p.stores,
    })),
    missing,
  };
}


  async upsertProduct(
    addressKey: string,
    itemcode: string,
    stores: StoreOffer[],
  ) {
    const doc = await this.getOrCreateAddress(addressKey);

    const product = doc.products.find(
      p => p.itemcode === itemcode,
    );

    if (product) {
      product.stores = stores;
      product.lastUpdated = new Date();
    } else {
      doc.products.push({
        itemcode,
        stores,
        lastUpdated: new Date(),
      });
    }

    await doc.save();
  }
}
