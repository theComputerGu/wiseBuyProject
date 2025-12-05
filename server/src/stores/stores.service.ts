import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './schemas/stores.schema';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name)
    private readonly storeModel: Model<StoreDocument>,
  ) {}

  // ✔ יצירה רגילה
  async create(data: Partial<Store>): Promise<Store> {
    const created = new this.storeModel(data);
    return created.save();
  }

  // ✔ שליפה לפי שאילתה
  async findAll(query: any): Promise<Store[]> {
    const filter: any = {};
    if (query.city) filter.city = query.city;
    if (query.ChainId) filter.ChainId = query.ChainId;
    return this.storeModel.find(filter).exec();
  }

  // ✔ שליפה לפי ID
  async findOne(id: string) {
    const store = await this.storeModel.findById(id).exec();
    if (!store) throw new NotFoundException();
    return store;
  }

  async update(id: string, data: Partial<Store>) {
    const updated = await this.storeModel.findByIdAndUpdate(id,data,{new:true});
    if (!updated) throw new NotFoundException();
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.storeModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException();
    return {deleted:true};
  }


  // 🆕 1) לבדוק אם יש Cached price תקף ולא צריך Scraping
  async getCachedPrices(barcodes: string[], ttlHours = 24) {
    const since = new Date(Date.now() - ttlHours*60*60*1000);

    return this.storeModel.find({
      $or: barcodes.map((code)=>({
        [`products.${code}.updatedAt`]: {$gte: since}
      }))
    });
  }

  // 🆕 2) לשמור מחיר חדש + היסטוריה
  async savePrice(
    storeId:string,
    barcode:string,
    price:number
  ){
    const now = new Date();

    return this.storeModel.findByIdAndUpdate(
      storeId,
      {
        $set:{
          [`products.${barcode}.price`]:price,
          [`products.${barcode}.updatedAt`]:now,
        },
        $push:{
          [`products.${barcode}.history`]:{price,date:now}
        }
      },
      {new:true}
    );
  }
}
