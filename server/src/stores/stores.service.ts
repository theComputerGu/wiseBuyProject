// src/stores/stores.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './schemas/stores.schema';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  // 🟢 Create a new store
  async create(data: Partial<Store>): Promise<Store> {
    const store = new this.storeModel(data);
    return store.save();
  }

  // 🟢 Get all stores
  async findAll(): Promise<Store[]> {
    return this.storeModel.find().exec();
  }

  // 🟢 Get a store by ID
  async findOne(id: string): Promise<Store> {
    const store = await this.storeModel.findById(id).exec();
    if (!store) throw new NotFoundException(`Store with ID ${id} not found`);
    return store;
  }

  // 🟡 Find nearby stores (within X meters)
  async findNearby(
    lat: number,
    lng: number,
    maxDistance = 5000, // default 5km
  ): Promise<Store[]> {
    return this.storeModel.find({
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    });
  }

  // 🔴 Delete a store
  async delete(id: string): Promise<Store | null> {
    return this.storeModel.findByIdAndDelete(id).exec();
  }
}
